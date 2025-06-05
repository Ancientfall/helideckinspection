const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { ROLES, isValidRole } = require('../constants/roles');
const router = express.Router();

const db = new sqlite3.Database('./database.sqlite');

// Register
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  // Validate role if provided
  const userRole = role && isValidRole(role) ? role : ROLES.SUPPLIER; // Default to supplier

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, userRole],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        
        const token = jwt.sign({ 
          id: this.lastID, 
          username,
          role: userRole 
        }, process.env.JWT_SECRET);
        
        res.json({ 
          token, 
          user: { 
            id: this.lastID, 
            username, 
            email,
            role: userRole
          } 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, username],
    async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ 
        id: user.id, 
        username: user.username,
        role: user.role || ROLES.SUPPLIER // Default for existing users
      }, process.env.JWT_SECRET);
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          role: user.role || ROLES.SUPPLIER
        } 
      });
    }
  );
});

module.exports = router;