// ─── THEME MANAGER (DARK / LIGHT MODE) ────────────────────────────────────────
(function () {
  'use strict';

  const STORAGE_KEY = 'evento_theme';

  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (_) {}
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateToggleButtons(theme);
  }

  function updateToggleButtons(theme) {
    const isDark = theme === 'dark';
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    const sunIcon = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    const moonIcon = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);

      const labelSpan = btn.querySelector('.theme-toggle-label');
      const iconContainer = btn.querySelector('.theme-toggle-icon');

      if (labelSpan && iconContainer) {
        iconContainer.innerHTML = isDark ? sunIcon : moonIcon;
        labelSpan.textContent = isDark ? 'Light mode' : 'Dark mode';
      } else if (labelSpan) {
        labelSpan.textContent = isDark ? 'Light mode' : 'Dark mode';
      } else {
        btn.innerHTML = isDark ? sunIcon : moonIcon;
      }
    });
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      console.warn('Evento: Could not save theme preference', e);
    }
    applyTheme(next);
  }

  // Initial apply immediately so DOM attribute is set
  applyTheme(getSavedTheme());
  document.documentElement.setAttribute('data-theme-ready', '1');

  // Robust event delegation for clicks on any theme-toggle button or child icon
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.theme-toggle-btn');
    if (btn) {
      e.preventDefault();
      toggleTheme();
    }
  });

  // Sync button icons when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      updateToggleButtons(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    });
  } else {
    updateToggleButtons(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  }

  // Listen to OS scheme changes if user hasn't explicitly set localStorage
  if (window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        try {
          if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light');
          }
        } catch (_) {}
      });
    } catch (_) {}
  }

  window.toggleTheme = toggleTheme;
})();
