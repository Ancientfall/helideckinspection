require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 files
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize database tables
initializeDatabase();

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Inspections table
    db.run(`CREATE TABLE IF NOT EXISTS inspections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id TEXT NOT NULL,
      facility_name TEXT NOT NULL,
      inspection_date DATE NOT NULL,
      inspector_name TEXT NOT NULL,
      helideck_condition TEXT,
      lighting_status TEXT,
      perimeter_net_status TEXT,
      friction_test_result TEXT,
      overall_status TEXT,
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`);

    // Attachments table
    db.run(`CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inspection_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mimetype TEXT,
      size INTEGER,
      path TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
    )`);

    // Helicards table
    db.run(`CREATE TABLE IF NOT EXISTS helicards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_name TEXT NOT NULL,
      operating_company TEXT NOT NULL,
      d_value TEXT,
      elevation TEXT,
      uploaded_by TEXT,
      file_name TEXT,
      file_data TEXT,
      compliance_frequency_painted BOOLEAN DEFAULT 0,
      compliance_tdpm_circle BOOLEAN DEFAULT 0,
      compliance_lighting_system BOOLEAN DEFAULT 0,
      compliance_obstacles_free BOOLEAN DEFAULT 0,
      last_updated DATE,
      expiry_date DATE,
      version TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('Database tables initialized');
  });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/facilities', require('./routes/facilities'));
app.use('/api/users', require('./routes/users'));

// Debug helicards route loading
try {
  const helicardsRouter = require('./routes/helicards');
  console.log('Helicards router loaded successfully');
  app.use('/api/helicards', helicardsRouter);
} catch (error) {
  console.error('Error loading helicards router:', error);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Helideck Inspection API is running' });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Export for use in other modules
module.exports = { app, db, server };