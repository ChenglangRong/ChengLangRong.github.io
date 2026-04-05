const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT_DIR = __dirname;
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT_DIR, 'data'));
const DB_PATH = path.join(DATA_DIR, 'visitor-analytics.db');
const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const HOST = (process.env.HOST || '0.0.0.0').trim() || '0.0.0.0';
const ADMIN_TOKEN = (process.env.ANALYTICS_ADMIN_TOKEN || '').trim();
const DEDUPE_WINDOW_MINUTES = Math.max(1, Number.parseInt(process.env.VISITOR_DEDUPE_MINUTES || '30', 10));
const LOOKUP_TIMEOUT_MS = Math.max(1000, Number.parseInt(process.env.GEO_LOOKUP_TIMEOUT_MS || '3500', 10));

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_hash TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    country TEXT NOT NULL,
    country_code TEXT NOT NULL,
    region TEXT,
    city TEXT,
    latitude REAL,
    longitude REAL,
    geo_timezone TEXT,
    client_timezone TEXT,
    user_agent TEXT,
    language TEXT,
    page_path TEXT,
    referrer TEXT,
    recorded_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_visits_recorded_at ON visits (recorded_at DESC);
  CREATE INDEX IF NOT EXISTS idx_visits_visitor_hash ON visits (visitor_hash, recorded_at DESC);
  CREATE INDEX IF NOT EXISTS idx_visits_country_code ON visits (country_code, recorded_at DESC);

  CREATE TABLE IF NOT EXISTS ip_locations (
    ip_hash TEXT PRIMARY KEY,
    country TEXT NOT NULL,
    country_code TEXT NOT NULL,
    region TEXT,
    city TEXT,
    latitude REAL,
    longitude REAL,
    geo_timezone TEXT,
    looked_up_at TEXT NOT NULL
  );
`);

const statements = {
  recentVisitByVisitor: db.prepare(`
    SELECT recorded_at
    FROM visits
    WHERE visitor_hash = ?
    ORDER BY recorded_at DESC
    LIMIT 1
  `),
  insertVisit: db.prepare(`
    INSERT INTO visits (
      visitor_hash,
      ip_hash,
      country,
      country_code,
      region,
      city,
      latitude,
      longitude,
      geo_timezone,
      client_timezone,
      user_agent,
      language,
      page_path,
      referrer,
      recorded_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  cachedLocation: db.prepare(`
    SELECT
      country,
      country_code,
      region,
      city,
      latitude,
      longitude,
      geo_timezone
    FROM ip_locations
    WHERE ip_hash = ?
  `),
  upsertLocation: db.prepare(`
    INSERT INTO ip_locations (
      ip_hash,
      country,
      country_code,
      region,
      city,
      latitude,
      longitude,
      geo_timezone,
      looked_up_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(ip_hash) DO UPDATE SET
      country = excluded.country,
      country_code = excluded.country_code,
      region = excluded.region,
      city = excluded.city,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      geo_timezone = excluded.geo_timezone,
      looked_up_at = excluded.looked_up_at
  `),
};

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.pdf', 'application/pdf'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
]);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function hashValue(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function clampText(value, maxLength) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

function normalizeIp(rawValue) {
  if (!rawValue) {
    return '';
  }

  let ip = String(rawValue).split(',')[0].trim();

  if (ip.includes('%')) {
    ip = ip.split('%')[0];
  }

  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }

  if (ip === '::1') {
    return '127.0.0.1';
  }

  return ip;
}

function extractClientIp(req) {
  const candidates = [
    req.headers['cf-connecting-ip'],
    req.headers['x-real-ip'],
    req.headers['x-forwarded-for'],
    req.socket.remoteAddress,
  ];

  for (const candidate of candidates) {
    const ip = normalizeIp(candidate);
    if (ip) {
      return ip;
    }
  }

  return '';
}

function isLoopbackIp(ip) {
  return ip === '127.0.0.1' || ip === '::1';
}

function isPrivateIp(ip) {
  if (!ip) {
    return true;
  }

  if (isLoopbackIp(ip)) {
    return true;
  }

  if (ip.includes(':')) {
    const lower = ip.toLowerCase();
    return lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80');
  }

  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('169.254.')) {
    return true;
  }

  if (ip.startsWith('172.')) {
    const secondOctet = Number.parseInt(ip.split('.')[1] || '', 10);
    return secondOctet >= 16 && secondOctet <= 31;
  }

  return false;
}

function parseAuthToken(req) {
  const header = clampText(req.headers.authorization || '', 512);
  if (!header.startsWith('Bearer ')) {
    return '';
  }

  return header.slice(7).trim();
}

function safeEquals(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function canReadAnalytics(req) {
  if (!ADMIN_TOKEN) {
    return isLoopbackIp(extractClientIp(req));
  }

  const providedToken = parseAuthToken(req);
  return Boolean(providedToken) && safeEquals(providedToken, ADMIN_TOKEN);
}

async function readJsonBody(req) {
  const chunks = [];
  let totalLength = 0;

  for await (const chunk of req) {
    totalLength += chunk.length;
    if (totalLength > 64 * 1024) {
      throw new Error('Request body too large');
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function buildUnknownLocation() {
  return {
    country: 'Unknown',
    country_code: '--',
    region: '',
    city: '',
    latitude: null,
    longitude: null,
    geo_timezone: '',
  };
}

function buildPrivateLocation() {
  return {
    country: 'Local Network',
    country_code: 'LOCAL',
    region: 'Private Range',
    city: 'Development',
    latitude: null,
    longitude: null,
    geo_timezone: '',
  };
}

async function fetchGeoLocation(ip) {
  const services = [
    {
      url: `https://freeipapi.com/api/json/${encodeURIComponent(ip)}`,
      normalize(payload) {
        if (!payload || !payload.countryName) {
          return null;
        }

        return {
          country: clampText(payload.countryName || 'Unknown', 80) || 'Unknown',
          country_code: clampText(payload.countryCode || '--', 8) || '--',
          region: clampText(payload.regionName || '', 120),
          city: clampText(payload.cityName || '', 120),
          latitude: Number.isFinite(payload.latitude) ? payload.latitude : null,
          longitude: Number.isFinite(payload.longitude) ? payload.longitude : null,
          geo_timezone: clampText(Array.isArray(payload.timeZones) ? payload.timeZones[0] || '' : '', 80),
        };
      },
    },
    {
      url: `https://ipinfo.io/${encodeURIComponent(ip)}/json`,
      normalize(payload) {
        if (!payload || !payload.country) {
          return null;
        }

        let latitude = null;
        let longitude = null;

        if (typeof payload.loc === 'string' && payload.loc.includes(',')) {
          const [latString, lonString] = payload.loc.split(',');
          latitude = Number.parseFloat(latString);
          longitude = Number.parseFloat(lonString);
        }

        return {
          country: clampText(payload.country || 'Unknown', 80) || 'Unknown',
          country_code: clampText(payload.country || '--', 8) || '--',
          region: clampText(payload.region || '', 120),
          city: clampText(payload.city || '', 120),
          latitude: Number.isFinite(latitude) ? latitude : null,
          longitude: Number.isFinite(longitude) ? longitude : null,
          geo_timezone: clampText(payload.timezone || '', 80),
        };
      },
    },
    {
      url: `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
      normalize(payload) {
        if (!payload || payload.error || !payload.country_name) {
          return null;
        }

        return {
          country: clampText(payload.country_name || 'Unknown', 80) || 'Unknown',
          country_code: clampText(payload.country_code || '--', 8) || '--',
          region: clampText(payload.region || '', 120),
          city: clampText(payload.city || '', 120),
          latitude: Number.isFinite(payload.latitude) ? payload.latitude : null,
          longitude: Number.isFinite(payload.longitude) ? payload.longitude : null,
          geo_timezone: clampText(payload.timezone || '', 80),
        };
      },
    },
  ];

  for (const service of services) {
    try {
      const response = await fetch(service.url, {
        signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
        headers: {
          'User-Agent': 'chenglang-homepage-analytics/1.0',
        },
      });

      if (!response.ok) {
        continue;
      }

      const payload = await response.json();
      const normalized = service.normalize(payload);
      if (normalized) {
        return normalized;
      }
    } catch (error) {
      continue;
    }
  }

  return buildUnknownLocation();
}

async function resolveLocation(ip, ipHash) {
  if (!ip || isPrivateIp(ip)) {
    return buildPrivateLocation();
  }

  const cached = statements.cachedLocation.get(ipHash);
  if (cached) {
    return cached;
  }

  const location = await fetchGeoLocation(ip);
  statements.upsertLocation.run(
    ipHash,
    location.country,
    location.country_code,
    location.region || '',
    location.city || '',
    location.latitude,
    location.longitude,
    location.geo_timezone || '',
    new Date().toISOString(),
  );
  return location;
}

function parseRange(range) {
  if (range === '7d' || range === '30d' || range === '90d' || range === 'all') {
    return range;
  }

  return '30d';
}

function rangeToSince(range) {
  if (range === 'all') {
    return null;
  }

  const days = Number.parseInt(range.replace('d', ''), 10);
  if (!Number.isFinite(days)) {
    return null;
  }

  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function buildWhereClause(since) {
  return since
    ? { sql: 'WHERE recorded_at >= ?', params: [since] }
    : { sql: '', params: [] };
}

function getAnalyticsSnapshot(range) {
  const since = rangeToSince(range);
  const { sql, params } = buildWhereClause(since);
  const mapSql = since
    ? 'WHERE recorded_at >= ? AND latitude IS NOT NULL AND longitude IS NOT NULL'
    : 'WHERE latitude IS NOT NULL AND longitude IS NOT NULL';

  const summary = db.prepare(`
    SELECT
      COUNT(*) AS total_visits,
      COUNT(DISTINCT visitor_hash) AS unique_visitors,
      COUNT(DISTINCT CASE
        WHEN country_code NOT IN ('--', 'LOCAL') THEN country_code
        ELSE NULL
      END) AS countries_reached,
      MAX(recorded_at) AS last_visit_at
    FROM visits
    ${sql}
  `).get(...params);

  const last24hSince = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const last24hSql = since
    ? 'WHERE recorded_at >= ? AND recorded_at >= ?'
    : 'WHERE recorded_at >= ?';
  const last24hParams = since ? [since, last24hSince] : [last24hSince];
  const last24h = db.prepare(`
    SELECT COUNT(*) AS visits_last_24h
    FROM visits
    ${last24hSql}
  `).get(...last24hParams);

  const topCountries = db.prepare(`
    SELECT
      country,
      country_code,
      COUNT(*) AS count
    FROM visits
    ${sql}
    GROUP BY country, country_code
    ORDER BY count DESC, country ASC
    LIMIT 8
  `).all(...params);

  const topLocations = db.prepare(`
    SELECT
      city,
      region,
      country,
      country_code,
      COUNT(*) AS count,
      MAX(recorded_at) AS last_visited_at
    FROM visits
    ${sql}
    GROUP BY city, region, country, country_code
    ORDER BY count DESC, last_visited_at DESC
    LIMIT 10
  `).all(...params);

  const visitsByDay = db.prepare(`
    SELECT day, count
    FROM (
      SELECT
        substr(recorded_at, 1, 10) AS day,
        COUNT(*) AS count
      FROM visits
      ${sql}
      GROUP BY day
      ORDER BY day DESC
      LIMIT 14
    )
    ORDER BY day ASC
  `).all(...params);

  const recentVisits = db.prepare(`
    SELECT
      recorded_at,
      city,
      region,
      country,
      country_code,
      referrer,
      page_path
    FROM visits
    ${sql}
    ORDER BY recorded_at DESC
    LIMIT 12
  `).all(...params);

  const mapPoints = db.prepare(`
    SELECT
      city,
      region,
      country,
      country_code,
      latitude,
      longitude,
      COUNT(*) AS count,
      MAX(recorded_at) AS last_visited_at
    FROM visits
    ${mapSql}
    GROUP BY city, region, country, country_code, latitude, longitude
    ORDER BY count DESC, last_visited_at DESC
    LIMIT 80
  `).all(...params);

  return {
    generatedAt: new Date().toISOString(),
    range,
    dedupeWindowMinutes: DEDUPE_WINDOW_MINUTES,
    summary: {
      totalVisits: summary?.total_visits || 0,
      uniqueVisitors: summary?.unique_visitors || 0,
      countriesReached: summary?.countries_reached || 0,
      visitsLast24h: last24h?.visits_last_24h || 0,
      lastVisitAt: summary?.last_visit_at || null,
    },
    topCountries,
    topLocations,
    visitsByDay,
    recentVisits,
    mapPoints,
  };
}

function resolveStaticPath(urlPathname) {
  const cleanPath = decodeURIComponent(urlPathname.split('?')[0]);
  const requestedPath = cleanPath === '/' ? '/index.html' : cleanPath;
  const absolutePath = path.resolve(ROOT_DIR, `.${requestedPath}`);

  if (!absolutePath.startsWith(ROOT_DIR)) {
    return null;
  }

  return absolutePath;
}

async function serveStatic(res, pathname) {
  const absolutePath = resolveStaticPath(pathname);
  if (!absolutePath) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  try {
    const stats = await fs.promises.stat(absolutePath);
    if (!stats.isFile()) {
      sendText(res, 404, 'Not Found');
      return;
    }

    const extension = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_TYPES.get(extension) || 'application/octet-stream';
    const fileBuffer = await fs.promises.readFile(absolutePath);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': fileBuffer.length,
      'Cache-Control': extension === '.html' ? 'no-store' : 'public, max-age=3600',
    });
    res.end(fileBuffer);
  } catch (error) {
    sendText(res, 404, 'Not Found');
  }
}

async function handleVisitorEvent(req, res) {
  let payload = {};

  try {
    payload = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: 'Invalid JSON body' });
    return;
  }

  const clientIp = extractClientIp(req);
  const normalizedUserAgent = clampText(req.headers['user-agent'] || '', 512);
  const pagePath = clampText(payload.pagePath || '/', 240) || '/';
  const referrer = clampText(payload.referrer || req.headers.referer || '', 240);
  const language = clampText(payload.language || req.headers['accept-language'] || '', 120);
  const clientTimezone = clampText(payload.timeZone || '', 80);

  const ipHash = hashValue(clientIp || 'unknown');
  const visitorHash = hashValue(`${clientIp || 'unknown'}|${normalizedUserAgent || 'unknown'}`);
  const now = new Date();
  const latestVisit = statements.recentVisitByVisitor.get(visitorHash);

  if (latestVisit?.recorded_at) {
    const elapsedMs = now.getTime() - new Date(latestVisit.recorded_at).getTime();
    if (elapsedMs < DEDUPE_WINDOW_MINUTES * 60 * 1000) {
      sendJson(res, 200, {
        logged: false,
        deduped: true,
        dedupeWindowMinutes: DEDUPE_WINDOW_MINUTES,
      });
      return;
    }
  }

  const location = await resolveLocation(clientIp, ipHash);
  const recordedAt = now.toISOString();

  statements.insertVisit.run(
    visitorHash,
    ipHash,
    location.country,
    location.country_code,
    location.region || '',
    location.city || '',
    location.latitude,
    location.longitude,
    location.geo_timezone || '',
    clientTimezone,
    normalizedUserAgent,
    language,
    pagePath,
    referrer,
    recordedAt,
  );

  sendJson(res, 201, {
    logged: true,
    recordedAt,
    location: {
      country: location.country,
      region: location.region || '',
      city: location.city || '',
      countryCode: location.country_code,
    },
  });
}

async function handleAnalytics(req, res, urlObject) {
  if (!canReadAnalytics(req)) {
    sendJson(res, 401, {
      error: ADMIN_TOKEN
        ? 'Analytics token required'
        : 'Analytics are only available from localhost until ANALYTICS_ADMIN_TOKEN is configured',
    });
    return;
  }

  const range = parseRange(urlObject.searchParams.get('range'));
  const snapshot = getAnalyticsSnapshot(range);
  sendJson(res, 200, snapshot);
}

function handleHealth(res) {
  sendJson(res, 200, {
    ok: true,
    timestamp: new Date().toISOString(),
    databasePath: DB_PATH,
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const method = req.method || 'GET';
    const urlObject = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = urlObject.pathname;

    if (method === 'POST' && pathname === '/api/visitor-events') {
      await handleVisitorEvent(req, res);
      return;
    }

    if (method === 'GET' && pathname === '/api/visitor-analytics') {
      await handleAnalytics(req, res, urlObject);
      return;
    }

    if (method === 'GET' && pathname === '/api/health') {
      handleHealth(res);
      return;
    }

    if (method === 'GET' || method === 'HEAD') {
      await serveStatic(res, pathname);
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Unexpected server error:', error);
    sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Homepage server running at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`Visitor analytics database: ${DB_PATH}`);

  if (ADMIN_TOKEN) {
    console.log('Analytics dashboard protection: enabled via ANALYTICS_ADMIN_TOKEN');
  } else {
    console.log('Analytics dashboard protection: localhost only (set ANALYTICS_ADMIN_TOKEN for remote access)');
  }
});

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  server.close(() => {
    try {
      db.close();
    } catch (error) {
      console.error('Failed to close SQLite database cleanly:', error);
    }
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
