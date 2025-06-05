const express = require('express');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const { PERMISSIONS } = require('../constants/roles');
const db = require('../database');
const router = express.Router();

// Get all facilities
router.get('/', authenticateToken, (req, res) => {
  const includeArchived = req.query.include_archived === 'true';
  
  const query = includeArchived 
    ? 'SELECT * FROM facilities ORDER BY status DESC, name'
    : 'SELECT * FROM facilities WHERE status = ? ORDER BY name';
  
  const params = includeArchived ? [] : ['Active'];
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching facilities:', err);
      return res.status(500).json({ error: 'Failed to fetch facilities' });
    }
    res.json(rows);
  });
});

// Get facility by ID
router.get('/:id', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM facilities WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        console.error('Error fetching facility:', err);
        return res.status(500).json({ error: 'Failed to fetch facility' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Facility not found' });
      }
      res.json(row);
    }
  );
});

// Create new facility (requires MANAGE_FACILITIES permission)
router.post('/', authenticateToken, requirePermission(PERMISSIONS.MANAGE_FACILITIES), (req, res) => {
  const { name, location, operator, type = 'Fixed' } = req.body;

  // Validate required fields
  if (!name || !location || !operator) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['name', 'location', 'operator'] 
    });
  }

  // Insert new facility
  db.run(
    `INSERT INTO facilities (name, location, operator, type, status, created_by) 
     VALUES (?, ?, ?, ?, 'Active', ?)`,
    [name, location, operator, type, req.user.id],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE')) {
          return res.status(409).json({ error: 'Facility with this name already exists' });
        }
        console.error('Error creating facility:', err);
        return res.status(500).json({ error: 'Failed to create facility' });
      }

      // Fetch the created facility
      db.get(
        'SELECT * FROM facilities WHERE id = ?',
        [this.lastID],
        (err, row) => {
          if (err || !row) {
            return res.status(500).json({ error: 'Failed to retrieve created facility' });
          }
          res.status(201).json({
            message: 'Facility created successfully',
            facility: row
          });
        }
      );
    }
  );
});

// Update facility (requires MANAGE_FACILITIES permission)
router.put('/:id', authenticateToken, requirePermission(PERMISSIONS.MANAGE_FACILITIES), (req, res) => {
  const { name, location, operator, type, status } = req.body;
  const facilityId = req.params.id;

  // Build dynamic update query
  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (location !== undefined) {
    updates.push('location = ?');
    values.push(location);
  }
  if (operator !== undefined) {
    updates.push('operator = ?');
    values.push(operator);
  }
  if (type !== undefined) {
    updates.push('type = ?');
    values.push(type);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  // Add updated_at timestamp
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(facilityId);

  const query = `UPDATE facilities SET ${updates.join(', ')} WHERE id = ?`;

  db.run(query, values, function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Facility with this name already exists' });
      }
      console.error('Error updating facility:', err);
      return res.status(500).json({ error: 'Failed to update facility' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    // Fetch updated facility
    db.get(
      'SELECT * FROM facilities WHERE id = ?',
      [facilityId],
      (err, row) => {
        if (err || !row) {
          return res.status(500).json({ error: 'Failed to retrieve updated facility' });
        }
        res.json({
          message: 'Facility updated successfully',
          facility: row
        });
      }
    );
  });
});

// Delete facility (requires MANAGE_FACILITIES permission)
router.delete('/:id', authenticateToken, requirePermission(PERMISSIONS.MANAGE_FACILITIES), (req, res) => {
  const facilityId = req.params.id;
  console.log('Delete request for facility ID:', facilityId);
  console.log('User role:', req.user.role);

  // Check if facility has associated inspections
  db.get(
    'SELECT COUNT(*) as count FROM inspections WHERE facility_id = ? OR facility_id = ?',
    [facilityId, String(facilityId)],
    (err, row) => {
      if (err) {
        console.error('Error checking inspections:', err);
        return res.status(500).json({ error: 'Failed to check facility dependencies' });
      }

      console.log('Inspection count for facility:', row.count);

      if (row.count > 0) {
        return res.status(409).json({ 
          error: 'Cannot delete facility with existing inspections',
          inspectionCount: row.count 
        });
      }

      // Soft delete - set status to Inactive instead of hard delete
      db.run(
        'UPDATE facilities SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['Inactive', facilityId],
        function(err) {
          if (err) {
            console.error('Error deleting facility:', err);
            return res.status(500).json({ error: 'Failed to delete facility' });
          }

          console.log('Delete query affected rows:', this.changes);

          if (this.changes === 0) {
            return res.status(404).json({ error: 'Facility not found' });
          }

          res.json({ message: 'Facility deleted successfully' });
        }
      );
    }
  );
});

// Get facility statistics (for dashboard)
router.get('/:id/stats', authenticateToken, (req, res) => {
  const facilityId = req.params.id;

  db.get(
    `SELECT 
      COUNT(*) as total_inspections,
      MAX(inspection_date) as last_inspection_date,
      AVG(CASE WHEN overall_status = 'Good' THEN 1 ELSE 0 END) * 100 as compliance_rate
     FROM inspections 
     WHERE facility_id = ?`,
    [facilityId],
    (err, row) => {
      if (err) {
        console.error('Error fetching facility stats:', err);
        return res.status(500).json({ error: 'Failed to fetch facility statistics' });
      }
      res.json(row);
    }
  );
});

module.exports = router;