(function () {
  const STORAGE_KEYS = {
    adminToken: 'visitor-analytics:admin-token',
    lastLogAt: 'visitor-analytics:last-log-at',
  };

  const RANGE_LABELS = {
    '7d': '7 Days',
    '30d': '30 Days',
    '90d': '90 Days',
    all: 'All Time',
  };

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key) || '';
    } catch (error) {
      return '';
    }
  }

  function writeStorage(key, value) {
    try {
      if (!value) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      return;
    }
  }

  function formatCount(value) {
    return new Intl.NumberFormat('en-US').format(Number(value || 0));
  }

  function formatDateTime(value) {
    if (!value) {
      return 'No data yet';
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  function formatDay(value) {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildLocationLabel(location) {
    const parts = [location.city, location.region, location.country]
      .map((item) => (item || '').trim())
      .filter(Boolean);

    return parts.length ? parts.join(', ') : 'Unknown location';
  }

  function buildReferrerLabel(referrer) {
    if (!referrer) {
      return 'Direct';
    }

    try {
      const parsed = new URL(referrer);
      return parsed.hostname;
    } catch (error) {
      return referrer;
    }
  }

  function createMapController(container) {
    if (!container || !window.L) {
      return null;
    }

    const map = window.L.map(container, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([20, 0], 2);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = window.L.layerGroup().addTo(map);

    return {
      render(points) {
        layerGroup.clearLayers();

        if (!points.length) {
          map.setView([20, 0], 2);
          return;
        }

        const bounds = [];

        points.forEach((point) => {
          if (!Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) {
            return;
          }

          const marker = window.L.circleMarker([point.latitude, point.longitude], {
            radius: Math.min(18, 5 + point.count * 1.6),
            weight: 1.5,
            color: '#215f54',
            fillColor: '#339683',
            fillOpacity: 0.55,
          });

          marker.bindPopup(`
            <div class="text-sm">
              <div class="font-semibold">${escapeHtml(buildLocationLabel(point))}</div>
              <div class="mt-1 text-slate-600">Visits: ${formatCount(point.count)}</div>
              <div class="text-slate-500">Last seen: ${escapeHtml(formatDateTime(point.last_visited_at))}</div>
            </div>
          `);

          marker.addTo(layerGroup);
          bounds.push([point.latitude, point.longitude]);
        });

        if (bounds.length) {
          map.fitBounds(bounds, {
            padding: [24, 24],
            maxZoom: 4,
          });
        }
      },
      invalidate() {
        map.invalidateSize();
      },
    };
  }

  async function logVisit() {
    const now = Date.now();
    const lastLoggedAt = Number.parseInt(readStorage(STORAGE_KEYS.lastLogAt) || '0', 10);
    if (Number.isFinite(lastLoggedAt) && now - lastLoggedAt < 30 * 60 * 1000) {
      return;
    }

    const payload = {
      pagePath: window.location.pathname,
      referrer: document.referrer || '',
      language: navigator.language || '',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    };

    try {
      const response = await fetch('/api/visitor-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        writeStorage(STORAGE_KEYS.lastLogAt, String(now));
      }
    } catch (error) {
      return;
    }
  }

  window.initVisitorAnalytics = function initVisitorAnalytics() {
    const section = document.getElementById('visitor-analytics');
    if (!section || section.dataset.ready === 'true') {
      return;
    }

    section.dataset.ready = 'true';

    const elements = {
      tokenInput: document.getElementById('analytics-token'),
      saveTokenButton: document.getElementById('analytics-save-token'),
      clearTokenButton: document.getElementById('analytics-clear-token'),
      refreshButton: document.getElementById('analytics-refresh'),
      status: document.getElementById('analytics-status'),
      totalVisits: document.getElementById('analytics-total-visits'),
      uniqueVisitors: document.getElementById('analytics-unique-visitors'),
      countriesReached: document.getElementById('analytics-countries-reached'),
      visitsLast24h: document.getElementById('analytics-last-24h'),
      lastUpdated: document.getElementById('analytics-last-updated'),
      topCountries: document.getElementById('analytics-top-countries'),
      topLocations: document.getElementById('analytics-top-locations'),
      trend: document.getElementById('analytics-trend'),
      recentVisits: document.getElementById('analytics-recent-visits'),
      emptyState: document.getElementById('analytics-empty-state'),
      rangeButtons: Array.from(document.querySelectorAll('[data-range-button]')),
      mapContainer: document.getElementById('analytics-map'),
    };

    const state = {
      range: '30d',
      token: readStorage(STORAGE_KEYS.adminToken),
      map: createMapController(elements.mapContainer),
    };

    elements.tokenInput.value = state.token;

    function setStatus(message, tone) {
      elements.status.textContent = message;
      elements.status.dataset.tone = tone || 'neutral';
    }

    function setSummaryValue(target, value) {
      target.textContent = value;
    }

    function renderTopCountries(list) {
      if (!list.length) {
        elements.topCountries.innerHTML = '<p class="analytics-empty">No country data yet.</p>';
        return;
      }

      elements.topCountries.innerHTML = list.map((item) => `
        <div class="analytics-rank-row">
          <div>
            <p class="analytics-rank-label">${escapeHtml(item.country || 'Unknown')}</p>
            <p class="analytics-rank-subtitle">${escapeHtml(item.country_code || '--')}</p>
          </div>
          <div class="analytics-rank-count">${formatCount(item.count)}</div>
        </div>
      `).join('');
    }

    function renderTopLocations(list) {
      if (!list.length) {
        elements.topLocations.innerHTML = '<p class="analytics-empty">No location data yet.</p>';
        return;
      }

      elements.topLocations.innerHTML = list.map((item) => `
        <div class="analytics-rank-row">
          <div>
            <p class="analytics-rank-label">${escapeHtml(buildLocationLabel(item))}</p>
            <p class="analytics-rank-subtitle">Last seen ${escapeHtml(formatDateTime(item.last_visited_at))}</p>
          </div>
          <div class="analytics-rank-count">${formatCount(item.count)}</div>
        </div>
      `).join('');
    }

    function renderTrend(list) {
      if (!list.length) {
        elements.trend.innerHTML = '<p class="analytics-empty">No daily trend data yet.</p>';
        return;
      }

      const maxCount = Math.max(...list.map((item) => Number(item.count || 0)), 1);
      elements.trend.innerHTML = list.map((item) => {
        const width = Math.max(8, Math.round((Number(item.count || 0) / maxCount) * 100));
        return `
          <div class="analytics-bar-row">
            <div class="analytics-bar-meta">
              <span>${escapeHtml(formatDay(item.day))}</span>
              <span>${formatCount(item.count)}</span>
            </div>
            <div class="analytics-bar-track">
              <div class="analytics-bar-fill" style="width:${width}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderRecentVisits(list) {
      if (!list.length) {
        elements.recentVisits.innerHTML = '<p class="analytics-empty">No recent visits recorded yet.</p>';
        return;
      }

      elements.recentVisits.innerHTML = `
        <div class="analytics-table-shell">
          <table class="analytics-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Location</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              ${list.map((item) => `
                <tr>
                  <td>${escapeHtml(formatDateTime(item.recorded_at))}</td>
                  <td>${escapeHtml(buildLocationLabel(item))}</td>
                  <td>${escapeHtml(buildReferrerLabel(item.referrer))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    function renderSnapshot(snapshot) {
      setSummaryValue(elements.totalVisits, formatCount(snapshot.summary.totalVisits));
      setSummaryValue(elements.uniqueVisitors, formatCount(snapshot.summary.uniqueVisitors));
      setSummaryValue(elements.countriesReached, formatCount(snapshot.summary.countriesReached));
      setSummaryValue(elements.visitsLast24h, formatCount(snapshot.summary.visitsLast24h));
      elements.lastUpdated.textContent = `Last updated ${formatDateTime(snapshot.generatedAt)}`;

      renderTopCountries(snapshot.topCountries || []);
      renderTopLocations(snapshot.topLocations || []);
      renderTrend(snapshot.visitsByDay || []);
      renderRecentVisits(snapshot.recentVisits || []);

      if (state.map) {
        state.map.render(snapshot.mapPoints || []);
        setTimeout(() => state.map.invalidate(), 80);
      }

      elements.emptyState.classList.toggle('hidden', snapshot.summary.totalVisits > 0);
      setStatus(`Showing ${RANGE_LABELS[snapshot.range]} of visitor data. One visit is recorded at most once every ${snapshot.dedupeWindowMinutes} minutes per visitor/browser pair.`, 'success');
    }

    function resetDashboard() {
      setSummaryValue(elements.totalVisits, '--');
      setSummaryValue(elements.uniqueVisitors, '--');
      setSummaryValue(elements.countriesReached, '--');
      setSummaryValue(elements.visitsLast24h, '--');
      elements.lastUpdated.textContent = 'Dashboard locked';
      elements.emptyState.classList.remove('hidden');
      elements.topCountries.innerHTML = '<p class="analytics-empty">Dashboard is locked.</p>';
      elements.topLocations.innerHTML = '<p class="analytics-empty">Dashboard is locked.</p>';
      elements.trend.innerHTML = '<p class="analytics-empty">Dashboard is locked.</p>';
      elements.recentVisits.innerHTML = '<p class="analytics-empty">Dashboard is locked.</p>';
      if (state.map) {
        state.map.render([]);
      }
    }

    async function loadAnalytics() {
      const headers = {};
      if (state.token) {
        headers.Authorization = `Bearer ${state.token}`;
      }

      setStatus(`Loading ${RANGE_LABELS[state.range]} of visitor data...`, 'neutral');

      try {
        const response = await fetch(`/api/visitor-analytics?range=${encodeURIComponent(state.range)}`, {
          headers,
        });

        if (response.status === 401) {
          resetDashboard();
          setStatus('This dashboard is protected. Set ANALYTICS_ADMIN_TOKEN on the server, then enter the same token here.', 'warning');
          return;
        }

        if (!response.ok) {
          throw new Error(`Unexpected status ${response.status}`);
        }

        const snapshot = await response.json();
        renderSnapshot(snapshot);
      } catch (error) {
        resetDashboard();
        setStatus('Unable to reach the analytics API. Start the site with node server.js so the /api endpoints are available.', 'error');
      }
    }

    elements.saveTokenButton.addEventListener('click', () => {
      state.token = elements.tokenInput.value.trim();
      writeStorage(STORAGE_KEYS.adminToken, state.token);
      loadAnalytics();
    });

    elements.clearTokenButton.addEventListener('click', () => {
      state.token = '';
      elements.tokenInput.value = '';
      writeStorage(STORAGE_KEYS.adminToken, '');
      loadAnalytics();
    });

    elements.refreshButton.addEventListener('click', () => {
      loadAnalytics();
    });

    elements.rangeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const nextRange = button.dataset.rangeButton;
        if (!nextRange || nextRange === state.range) {
          return;
        }

        state.range = nextRange;
        elements.rangeButtons.forEach((item) => {
          item.classList.toggle('is-active', item === button);
        });
        loadAnalytics();
      });
    });

    logVisit();
    loadAnalytics();
  };
})();
