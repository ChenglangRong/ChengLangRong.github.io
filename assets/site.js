document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const currentPage = body.dataset.page || 'home';
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('[data-nav-page]');
  const revealItems = document.querySelectorAll('.reveal');
  const detailModal = document.getElementById('detail-modal');
  const detailModalTitle = document.getElementById('detail-modal-title');
  const detailModalBody = document.getElementById('detail-modal-body');
  const detailModalClose = document.getElementById('detail-modal-close');
  const modalButtons = document.querySelectorAll('[data-modal-button]');
  const copyButtons = document.querySelectorAll('[data-copy-text]');
  const qrEntryButton = document.getElementById('qr-entry-button');
  const qrEntryDialog = document.getElementById('qr-entry-dialog');
  const qrCloseButtons = document.querySelectorAll('[data-qr-close]');
  let lastModalTrigger = null;

  navLinks.forEach((link) => {
    const isActive = link.dataset.navPage === currentPage;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    }
  });

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      const expanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      mobileMenuButton.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.hidden = expanded;
      mobileMenuButton.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
    });
  }

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const setModalLock = () => {
    if (detailModal) {
      body.classList.toggle('modal-open', !detailModal.hidden);
    }
  };

  const closeModal = () => {
    if (detailModal && detailModalBody) {
      detailModal.hidden = true;
      detailModalBody.innerHTML = '';
      setModalLock();
      if (lastModalTrigger) {
        lastModalTrigger.focus();
      }
    }
  };

  if (detailModal && detailModalTitle && detailModalBody) {
    modalButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const template = document.getElementById(button.dataset.template || '');
        lastModalTrigger = button;
        detailModalTitle.textContent = button.dataset.title || 'Detail';
        detailModalBody.innerHTML = template ? template.innerHTML : '';
        detailModal.hidden = false;
        setModalLock();
        if (detailModalClose) {
          detailModalClose.focus();
        }
      });
    });

    if (detailModalClose) {
      detailModalClose.addEventListener('click', closeModal);
    }

    detailModal.addEventListener('click', (event) => {
      if (event.target === detailModal || event.target.classList.contains('modal-backdrop')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && detailModal && !detailModal.hidden) {
        closeModal();
      }
    });
  }

  if (qrEntryButton && qrEntryDialog) {
    const closeQrDialog = () => {
      if (qrEntryDialog.open) {
        qrEntryDialog.close();
      }
    };

    qrEntryButton.addEventListener('click', () => {
      qrEntryDialog.showModal();
      qrEntryButton.setAttribute('aria-expanded', 'true');
      body.classList.add('modal-open');
    });

    qrCloseButtons.forEach((button) => {
      button.addEventListener('click', closeQrDialog);
    });

    qrEntryDialog.addEventListener('click', (event) => {
      if (event.target === qrEntryDialog) {
        closeQrDialog();
      }
    });

    qrEntryDialog.addEventListener('close', () => {
      qrEntryButton.setAttribute('aria-expanded', 'false');
      body.classList.remove('modal-open');
      qrEntryButton.focus();
    });
  }

  copyButtons.forEach((button) => {
    const initialContent = button.innerHTML;
    button.addEventListener('click', async () => {
      const text = button.dataset.copyText || '';
      const copyWithTextarea = () => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        let copied = false;
        try {
          copied = document.execCommand('copy');
        } catch (error) {
          copied = false;
        }
        textarea.remove();
        return copied;
      };

      let copied = false;
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          copied = true;
        } catch (error) {
          copied = copyWithTextarea();
        }
      } else {
        copied = copyWithTextarea();
      }

      button.textContent = copied ? 'Copied' : 'Manual Copy';
      window.setTimeout(() => {
        button.innerHTML = initialContent;
      }, 1600);
    });
  });
});
