function renderMyRegistrations() {
  const list = document.getElementById('reg-list');
  if (!list) return;

  const regs = JSON.parse(localStorage.getItem('evento_registrations') || '[]');

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
    const ev = EVENTS.find(e => e.id === reg.eventId);
    const dateStr = ev ? new Date(ev.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric'}) : '';
    return `
      <div class="reg-item" id="reg-${reg.id}">
        <div class="reg-item-icon">${reg.eventEmoji || '📅'}</div>
        <div class="reg-item-info">
          <div class="reg-item-title">${reg.eventTitle}</div>
          <div class="reg-item-meta">${dateStr ? dateStr + ' · ' : ''}Registered as ${reg.name} · ${reg.email}</div>
        </div>
        <button class="btn-cancel" onclick="cancelRegistration('${reg.id}')">Cancel</button>
      </div>`;
  }).join('');
}

function cancelRegistration(id) {
  if (!confirm('Cancel this registration?')) return;
  const regs = JSON.parse(localStorage.getItem('evento_registrations') || '[]');
  const updated = regs.filter(r => r.id !== id);
  localStorage.setItem('evento_registrations', JSON.stringify(updated));
  renderMyRegistrations();
  showToast('Registration cancelled.');
}

document.addEventListener('DOMContentLoaded', renderMyRegistrations);
