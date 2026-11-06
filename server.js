const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin';
const adminSessions = new Set();

function readEventStore() {
  try {
    return JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') console.warn('Evento: could not read event store', error);
    return { events: [], deletedIds: [] };
  }
}

function writeEventStore(store) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(store, null, 2));
}

function requireAdmin(req, res, next) {
  const token = req.get('x-admin-token');
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: 'Admin authentication required.' });
  }
  next();
}

// ─── SEC-7: Basic HTTP security headers ──────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.get('/api/events', (req, res) => {
  res.json(readEventStore());
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Invalid admin username or password.' });
  }
  const token = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  adminSessions.add(token);
  res.json({ token });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  adminSessions.delete(req.get('x-admin-token'));
  res.status(204).end();
});

app.post('/api/admin/events', requireAdmin, (req, res) => {
  const input = req.body || {};
  const required = ['title', 'category', 'date', 'time', 'venue', 'shortDesc', 'longDesc', 'organizer', 'price'];
  if (required.some(field => typeof input[field] !== 'string' || !input[field].trim())) {
    return res.status(400).json({ error: 'Please complete all required event fields.' });
  }
  const store = readEventStore();
  const event = {
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: input.title.trim(),
    category: input.category.trim(),
    date: input.date,
    time: input.time.trim(),
    venue: input.venue.trim(),
    shortDesc: input.shortDesc.trim(),
    longDesc: input.longDesc.trim(),
    image: typeof input.image === 'string' ? input.image.trim() : '',
    organizer: input.organizer.trim(),
    price: input.price.trim(),
    emoji: typeof input.emoji === 'string' && input.emoji.trim() ? input.emoji.trim() : '📅',
    createdAt: new Date().toISOString()
  };
  store.events.push(event);
  writeEventStore(store);
  res.status(201).json(event);
});

app.delete('/api/admin/events/:id', requireAdmin, (req, res) => {
  const store = readEventStore();
  const id = req.params.id;
  const customIndex = store.events.findIndex(event => String(event.id) === id);
  if (customIndex >= 0) {
    store.events.splice(customIndex, 1);
  } else if (/^\d+$/.test(id)) {
    if (!store.deletedIds.includes(Number(id))) store.deletedIds.push(Number(id));
  } else {
    return res.status(404).json({ error: 'Event not found.' });
  }
  writeEventStore(store);
  res.status(204).end();
});

// Serve all static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public'), {
  // Add cache headers for static assets
  maxAge: '1h',
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      // Never cache HTML so users always get fresh content
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    if (filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Route all unknown paths to index.html (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Evento running on http://localhost:${PORT}`);
  });
}

module.exports = app;
