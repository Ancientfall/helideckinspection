const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES, isValidRole, ROLE_DISPLAY_NAMES } = require('../constants/roles');

const router = express.Router();
const db = new sqlite3.Database('./database.sqlite');

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole(ROLES.ADMIN), (req, res) => {
  db.all(
    'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC',
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
      res.json(users);
    }
  );
});

// Get user by ID (Admin only)
router.get('/:id', authenticateToken, requireRole(ROLES.ADMIN), (req, res) => {
  const { id } = req.params;
  
  db.get(
    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
    [id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch user' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Update user role (Admin only)
router.patch('/:id/role', authenticateToken, requireRole(ROLES.ADMIN), (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  // Validate role
  if (!role || !isValidRole(role)) {
    return res.status(400).json({ 
      error: 'Invalid role',
      validRoles: Object.values(ROLES),
      roleDescriptions: ROLE_DISPLAY_NAMES
    });
  }
  
  // Prevent admin from changing their own role
  if (req.user.id === parseInt(id)) {
    return res.status(400).json({ error: 'Cannot change your own role' });
  }
  
  db.run(
    'UPDATE users SET role = ? WHERE id = ?',
    [role, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update user role' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User role updated successfully', role });
    }
  );
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireRole(ROLES.ADMIN), (req, res) => {
  const { id } = req.params;
  
  // Prevent admin from deleting themselves
  if (req.user.id === parseInt(id)) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  
  db.run(
    'DELETE FROM users WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete user' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
    }
  );
});

// Get current user info
router.get('/me', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch user info' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Update current user password
router.patch('/me/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' });
  }
  
  // Get user with password
  db.get(
    'SELECT * FROM users WHERE id = ?',
    [req.user.id],
    async (err, user) => {
      if (err || !user) {
        return res.status(500).json({ error: 'Failed to fetch user' });
      }
      
      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid current password' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, req.user.id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update password' });
          }
          
          res.json({ message: 'Password updated successfully' });
        }
      );
    }
  );
});

// Get available roles (for UI dropdowns)
router.get('/roles/list', authenticateToken, (req, res) => {
  const roles = Object.entries(ROLES).map(([key, value]) => ({
    value,
    label: ROLE_DISPLAY_NAMES[value],
    key
  }));
  
  res.json(roles);
});

module.exports = router;