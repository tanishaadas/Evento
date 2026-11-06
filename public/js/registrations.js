function renderMyRegistrations() {
  const list = document.getElementById('reg-list');
  if (!list) return;

  const regs = readRegistrations();

  if (regs.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No registrations yet</h3>
        <p>Browse events and register for ones you'd like to attend.</p>
        <a href="events.html" class="btn-primary" style="display:inline-flex;margin-top:16px">Browse Events</a>
      </div>`;
    return;
  }

  list.innerHTML = regs.slice().reverse().map(reg => {
    const ev = EVENTS.find(e => String(e.id) === String(reg.eventId));
    const eventDate = (ev && ev.date) || reg.eventDate;
    const dateStr = eventDate ? new Date(eventDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric'}) : '';
    // SEC-2: escape user-supplied strings before inserting into innerHTML
    const safeTitle = escHtml(reg.eventTitle || (ev && ev.title) || 'Event');
    const safeName  = escHtml(reg.name || '');
    const safeEmail = escHtml(reg.email || '');
    const safeId    = escHtml(reg.id || '');
    return `
      <div class="reg-item" id="reg-${safeId}">
        <div class="reg-item-icon">${reg.eventEmoji || (ev && ev.emoji) || '📅'}</div>
        <div class="reg-item-info">
          <div class="reg-item-title">${safeTitle}</div>
          <div class="reg-item-meta">${dateStr ? dateStr + ' · ' : ''}Registered as ${safeName} · ${safeEmail}</div>
        </div>
        <button class="btn-cancel" onclick="cancelRegistration('${safeId}')">Cancel</button>
      </div>`;
  }).join('');
}

function cancelRegistration(id) {
  if (!confirm('Cancel this registration?')) return;
  const regs = readRegistrations();
  const updated = regs.filter(r => r.id !== id);
  writeRegistrations(updated);
  renderMyRegistrations();
  showToast('Registration cancelled.');
}

document.addEventListener('DOMContentLoaded', () => {
  renderMyRegistrations();
  const ready = window.eventoEventsReady || Promise.resolve(EVENTS);
  ready.then(renderMyRegistrations);
});
