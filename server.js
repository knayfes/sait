require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const { initDatabase } = require('./db/init');
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

console.log('Server starting...');
console.log('PORT:', PORT);

try {
  initDatabase();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/')) res.setHeader('Content-Type', 'text/html; charset=utf-8');
  next();
});
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-only-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false }
}));

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css; charset=utf-8');
    if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    if (filePath.endsWith('.json')) res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
}));

app.use((error, req, res, next) => {
  console.error('Unhandled request error:', error);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Database initialized');
  console.log('Admin account created: Knayfes');
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exitCode = 1;
});
