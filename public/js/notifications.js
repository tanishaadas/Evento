(function () {
  const STORAGE_KEY = 'evento_notifications';

  function readNotifications() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Evento: could not read notifications', error);
      return [];
    }
  }

  window.addEventoNotification = function (type, message, eventId) {
    const notifications = readNotifications();
    notifications.push({
      id: `notification_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      message,
      eventId: eventId || null,
      createdAt: new Date().toISOString(),
      read: false
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.warn('Evento: could not save notification', error);
    }
  };

  window.readEventoNotifications = readNotifications;
  window.markEventoNotificationsRead = function () {
    const updated = readNotifications().map(notification => ({ ...notification, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };
})();
