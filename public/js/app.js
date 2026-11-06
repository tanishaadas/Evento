// ─── STATE ───────────────────────────────────────────────────────────────────
let state = {
  activeTab: 'all',       // all | upcoming | ongoing | past
  activeCategory: 'All',
  searchQuery: '',
  viewMode: 'grid',       // grid | list
  selectedEvent: null,
  registrationEvent: null,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function categoryTagClass(cat) {
  const map = {
    Technology: 'tag-tech', Music: 'tag-music', Business: 'tag-business',
    Sports: 'tag-sports', Arts: 'tag-arts', Workshop: 'tag-workshop',
    Community: 'tag-community'
  };
  return map[cat] || 'tag-tech';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getFilteredEvents() {
  return EVENTS.filter(ev => {
    const matchTab = state.activeTab === 'all' || ev.status === state.activeTab;
    const matchCat = state.activeCategory === 'All' || ev.category === state.activeCategory;
    const q = state.searchQuery.toLowerCase();
    const matchSearch = !q ||
      ev.title.toLowerCase().includes(q) ||
      ev.category.toLowerCase().includes(q) ||
      ev.venue.toLowerCase().includes(q) ||
      ev.shortDesc.toLowerCase().includes(q);
    return matchTab && matchCat && matchSearch;
  });
}

// ─── CARD HTML ────────────────────────────────────────────────────────────────
function buildCard(ev) {
  const imgHtml = ev.image
    ? `<img src="${ev.image}" alt="${ev.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';
  const placeholderStyle = ev.image ? 'display:none;' : '';
  const bgColors = {
    Technology: 'linear-gradient(135deg,#1a1a4e,#3d2caa)',
    Music:      'linear-gradient(135deg,#2d0a3e,#8a2be2)',
    Business:   'linear-gradient(135deg,#1a2e1a,#2d7a3a)',
    Sports:     'linear-gradient(135deg,#1a1a2e,#2b5eb0)',
    Arts:       'linear-gradient(135deg,#2e1a1a,#c0392b)',
    Workshop:   'linear-gradient(135deg,#1a2e2e,#1a7a7a)',
    Community:  'linear-gradient(135deg,#1a2a1a,#5a8a2a)',
  };
  const bg = bgColors[ev.category] || 'linear-gradient(135deg,#1a1a2e,#3d1c8f)';

  return `
    <article class="event-card" onclick="openDetail(${ev.id})" tabindex="0" role="button" aria-label="View details for ${ev.title}">
      <div class="card-banner">
        ${imgHtml}
        <div class="card-banner-placeholder" style="${placeholderStyle}background:${bg}">${ev.emoji}</div>
        <span class="card-status status-${ev.status}">
          ${ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
        </span>
      </div>
      <div class="card-body">
        <div class="card-category">
          <span class="tag ${categoryTagClass(ev.category)}">${ev.category}</span>
        </div>
        <h3 class="card-title">${ev.title}</h3>
        <div class="card-meta">
          <div class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${formatDate(ev.date)} · ${ev.time}
          </div>
          <div class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${ev.venue.split(',')[0]}
          </div>
        </div>
      </div>
      <div class="card-footer">
        <span class="card-price">${ev.price}</span>
        <button class="btn-card" onclick="event.stopPropagation();openRegForm(${ev.id})">Register</button>
      </div>
    </article>`;
}

// ─── RENDER EVENTS ────────────────────────────────────────────────────────────
function renderEvents() {
  const grid = document.getElementById('events-grid');
  const countEl = document.getElementById('events-count');
  if (!grid) return;

  const filtered = getFilteredEvents();
  grid.className = `events-grid${state.viewMode === 'list' ? ' list-view' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No events found</h3>
        <p>Try adjusting your search or filters to find what you're looking for.</p>
      </div>`;
  } else {
    grid.innerHTML = filtered.map(buildCard).join('');
  }

  if (countEl) {
    countEl.innerHTML = `Showing <span>${filtered.length}</span> of <span>${EVENTS.length}</span> events`;
  }
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function openDetail(id) {
  const ev = EVENTS.find(e => e.id === id);
  if (!ev) return;
  state.selectedEvent = ev;

  const panel = document.getElementById('detail-overlay');
  const body = document.getElementById('detail-body');

  const imgHtml = ev.image
    ? `<img src="${ev.image}" alt="${ev.title}">`
    : `<div class="detail-banner-placeholder" style="background:linear-gradient(135deg,#2a0d7a,#5b2fd4)">${ev.emoji}</div>`;

  document.getElementById('detail-banner-img').innerHTML = imgHtml;
  body.innerHTML = `
    <div class="detail-header">
      <span class="tag ${categoryTagClass(ev.category)}">${ev.category}</span>
      <h2 class="detail-title">${ev.title}</h2>
      <span class="card-status status-${ev.status}" style="display:inline-block">
        ${ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
      </span>
    </div>
    <div class="detail-meta">
      <div class="meta-item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        ${formatDate(ev.date)} at ${ev.time}
      </div>
      <div class="meta-item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${ev.venue}
      </div>
      <div class="meta-item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        Organised by ${ev.organizer}
      </div>
      <div class="meta-item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        ${ev.price}
      </div>
    </div>
    <div class="detail-desc">
      <h3>About this event</h3>
      <p>${ev.longDesc}</p>
    </div>`;

  panel.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('detail-register-btn').onclick = () => {
    closeDetail();
    openRegForm(ev.id);
  };
}

function closeDetail() {
  document.getElementById('detail-overlay').classList.remove('open');
  document.body.style.overflow = '';
  state.selectedEvent = null;
}

// ─── REGISTRATION FORM ────────────────────────────────────────────────────────
function openRegForm(id) {
  const ev = id ? EVENTS.find(e => e.id === id) : null;
  state.registrationEvent = ev || null;

  const overlay = document.getElementById('reg-overlay');
  const eventInfo = document.getElementById('selected-event-info');
  const eventSelect = document.getElementById('reg-event');

  if (ev && eventInfo) {
    eventInfo.textContent = `📅 Registering for: ${ev.title}`;
    eventInfo.classList.add('show');
  } else if (eventInfo) {
    eventInfo.classList.remove('show');
  }

  if (eventSelect) {
    eventSelect.value = ev ? String(ev.id) : '';
  }

  clearFormErrors();
  document.getElementById('reg-form').reset();
  if (ev && eventSelect) eventSelect.value = String(ev.id);
  if (ev && eventInfo) {
    eventInfo.textContent = `📅 Registering for: ${ev.title}`;
    eventInfo.classList.add('show');
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeRegForm() {
  document.getElementById('reg-overlay').classList.remove('open');
  document.body.style.overflow = '';
  state.registrationEvent = null;
}

// ─── FORM VALIDATION ──────────────────────────────────────────────────────────
function clearFormErrors() {
  document.querySelectorAll('.form-input.error, .form-select.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.field-error.show').forEach(el => el.classList.remove('show'));
}

function showFieldError(fieldId, msg) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById(fieldId + '-error');
  if (field) field.classList.add('error');
  if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

function handleRegSubmit(e) {
  e.preventDefault();
  clearFormErrors();

  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const evId  = document.getElementById('reg-event').value;

  let valid = true;
  if (!name || name.length < 2) { showFieldError('reg-name', 'Please enter your full name.'); valid = false; }
  if (!email) { showFieldError('reg-email', 'Email address is required.'); valid = false; }
  else if (!validateEmail(email)) { showFieldError('reg-email', 'Please enter a valid email address.'); valid = false; }
  if (!phone) { showFieldError('reg-phone', 'Phone number is required.'); valid = false; }
  else if (!validatePhone(phone)) { showFieldError('reg-phone', 'Enter a valid 10-digit Indian mobile number.'); valid = false; }
  if (!evId) { showFieldError('reg-event', 'Please select an event.'); valid = false; }

  if (!valid) return;

  const ev = EVENTS.find(e => e.id === parseInt(evId));
  const reg = {
    id: 'reg_' + Date.now(),
    name, email, phone,
    eventId: parseInt(evId),
    eventTitle: ev ? ev.title : 'Unknown Event',
    eventDate: ev ? ev.date : '',
    eventEmoji: ev ? ev.emoji : '📅',
    registeredAt: new Date().toISOString()
  };

  // Save to localStorage
  const existing = JSON.parse(localStorage.getItem('evento_registrations') || '[]');
  existing.push(reg);
  localStorage.setItem('evento_registrations', JSON.stringify(existing));

  closeRegForm();
  showToast(`✅ You're registered for ${ev ? ev.title : 'the event'}!`);

  // Refresh my-registrations page if visible
  if (typeof renderMyRegistrations === 'function') renderMyRegistrations();
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = `<span class="toast-icon">🎉</span>${msg}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3800);
}

// ─── SIDEBAR / MOBILE ────────────────────────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  overlay && overlay.classList.toggle('open');
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      state.searchQuery = e.target.value;
      renderEvents();
    });
  }

  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeTab = btn.dataset.tab;
      renderEvents();
    });
  });

  // Category select
  const catSelect = document.getElementById('category-select');
  if (catSelect) {
    catSelect.addEventListener('change', e => {
      state.activeCategory = e.target.value;
      renderEvents();
    });
  }

  // View toggle
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.viewMode = btn.dataset.view;
      renderEvents();
    });
  });

  // Detail overlay close
  const detailOverlay = document.getElementById('detail-overlay');
  if (detailOverlay) {
    detailOverlay.addEventListener('click', e => {
      if (e.target === detailOverlay) closeDetail();
    });
  }

  // Reg overlay close
  const regOverlay = document.getElementById('reg-overlay');
  if (regOverlay) {
    regOverlay.addEventListener('click', e => {
      if (e.target === regOverlay) closeRegForm();
    });
  }

  // Reg form submit
  const regForm = document.getElementById('reg-form');
  if (regForm) regForm.addEventListener('submit', handleRegSubmit);

  // Event select change
  const evSelect = document.getElementById('reg-event');
  if (evSelect) {
    evSelect.addEventListener('change', e => {
      const ev = EVENTS.find(ev => ev.id === parseInt(e.target.value));
      const info = document.getElementById('selected-event-info');
      if (info) {
        if (ev) {
          info.textContent = `📅 Registering for: ${ev.title}`;
          info.classList.add('show');
        } else {
          info.classList.remove('show');
        }
      }
    });
  }

  // Mobile sidebar toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', toggleSidebar);
  const sidebarOverlay = document.querySelector('.sidebar-overlay');
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

  // Keyboard: close panels on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDetail();
      closeRegForm();
    }
  });

  // Card keyboard activation
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.classList.contains('event-card')) {
      e.target.click();
    }
  });

  // Initial render
  renderEvents();
});
