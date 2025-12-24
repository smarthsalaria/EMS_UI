// Updated backend using PostgreSQL instead of db.json

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import listEndpoints from 'express-list-endpoints';
import pkg from 'pg';

const { Pool } = pkg;
dotenv.config();

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

// PostgreSQL DB connection
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASS,
  port: process.env.PG_PORT,
});

// Token validation middleware
const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers['authorization'];
  const token = tokenHeader?.split(' ')[1];
  console.log("🔐 Received token:", token);
  if (!token) return res.status(403).json({ success: false, message: 'Token is missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    if (decoded.sessionExpiryTime && decoded.sessionExpiryTime < Date.now()) {
      return res.status(403).json({ success: false, message: 'Session expired' });
    }
    req.user = decoded;
    next();
  });
};

// Root route
app.get('/', (req, res) => {
  res.send('EMS API is running ✅');
});

// Login route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('🔍 Login payload:', req.body);

  try {
    const userRes = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2 AND isdeleted = false',
      [username, password]

    );

    const user = userRes.rows[0];
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    console.log('🔍 Login payload:', req.body);

    const accessRes = await pool.query('SELECT access_key FROM user_access WHERE user_id = $1', [user.id]);
    const access = accessRes.rows.map(r => r.access_key);

    const sessionExpiryTime = Date.now() + parseInt(process.env.SESSION_EXPIRY_MS || '1800000');



    const token = jwt.sign(
      { id: user.id, username: user.username, sessionExpiryTime },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRY || '1h' }
    );
    console.log('🔍 Login payload:', req.body);
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: { ...safeUser, access }, token, sessionExpiryTime });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all users
app.get('/api/users', verifyToken, async (_, res) => {
  try {
    const usersRes = await pool.query('SELECT id, username, name, email, role, isdeleted FROM users WHERE isdeleted = false');
    const users = usersRes.rows;

    for (const user of users) {
      const accessRes = await pool.query('SELECT access_key FROM user_access WHERE user_id = $1', [user.id]);
      user.access = accessRes.rows.map(r => r.access_key);
    }

    res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ success: false });
  }
});

// Create user
app.post('/api/users', verifyToken, async (req, res) => {
  const { username, password, name, email, role = 'user', access = [] } = req.body;

  try {
    const check = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
    if (check.rows.length) return res.status(409).json({ success: false, message: 'Username exists' });

    const insertUser = await pool.query(
      'INSERT INTO users (username, password, name, email, role, isdeleted) VALUES ($1, $2, $3, $4, $5, false) RETURNING id, username, name, email, role',
      [username, password, name, email, role]
    );

    const user = insertUser.rows[0];
    for (const key of access) {
      await pool.query('INSERT INTO user_access (user_id, access_key) VALUES ($1, $2)', [user.id, key]);
    }

    user.access = access;
    res.status(201).json(user);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ success: false });
  }
});

// Update user
app.put('/api/users/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { username, password, name, email, role, access = [] } = req.body;

  try {
    await pool.query(
      'UPDATE users SET username=$1, password=$2, name=$3, email=$4, role=$5 WHERE id=$6',
      [username, password, name, email, role, id]
    );

    await pool.query('DELETE FROM user_access WHERE user_id = $1', [id]);
    for (const key of access) {
      await pool.query('INSERT INTO user_access (user_id, access_key) VALUES ($1, $2)', [id, key]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false });
  }
});

// Delete user
app.delete('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('UPDATE users SET isdeleted = true WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false });
  }
});

app.get('/api/metrics', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dummy_data');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching metrics:', err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

app.get('/api/alarms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alarms ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching alarms:', err);
    res.status(500).json({ error: 'Failed to fetch alarms' });
  }
});



// Access rights list
app.get('/api/access-rights', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM access_rights');
    res.json(result.rows);
  } catch (err) {
    console.error('Access rights fetch error:', err);
    res.status(500).json({ success: false });
  }
});

// Token renewal
app.post('/api/renew-token', verifyToken, (req, res) => {
  const { id, username } = req.user;
  const newSessionExpiryTime = Date.now() + (process.env.TOKEN_EXPIRY || 30 * 60 * 1000);

  const newToken = jwt.sign(
    { id, username, sessionExpiryTime: newSessionExpiryTime },
    process.env.JWT_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRY || '1h' }
  );

  res.json({ success: true, token: newToken, sessionExpiryTime: newSessionExpiryTime });
});

// Fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' }); // ✅ JSON
});



app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  const endpoints = listEndpoints(app);
  endpoints.forEach((e) => console.log(`${e.methods.join(' | ')} ${e.path}`));
});