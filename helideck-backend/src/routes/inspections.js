const express = require('express');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const db = new sqlite3.Database('./database.sqlite');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// Get all inspections
router.get('/', authenticateToken, (req, res) => {
  db.all(
    `SELECT i.*, u.username as inspector_username 
     FROM inspections i 
     LEFT JOIN users u ON i.created_by = u.id 
     ORDER BY i.inspection_date DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch inspections' });
      }
      res.json(rows);
    }
  );
});

// Get inspection by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get(
    `SELECT i.*, u.username as inspector_username 
     FROM inspections i 
     LEFT JOIN users u ON i.created_by = u.id 
     WHERE i.id = ?`,
    [id],
    (err, inspection) => {
      if (err || !inspection) {
        return res.status(404).json({ error: 'Inspection not found' });
      }
      
      // Get attachments
      db.all(
        'SELECT * FROM attachments WHERE inspection_id = ?',
        [id],
        (err, attachments) => {
          if (err) attachments = [];
          res.json({ ...inspection, attachments });
        }
      );
    }
  );
});

// Create new inspection
router.post('/', authenticateToken, upload.array('attachments', 10), (req, res) => {
  const {
    facility_id,
    facility_name,
    inspection_date,
    inspector_name,
    helideck_condition,
    lighting_status,
    perimeter_net_status,
    friction_test_result,
    overall_status,
    notes
  } = req.body;

  db.run(
    `INSERT INTO inspections (
      facility_id, facility_name, inspection_date, inspector_name,
      helideck_condition, lighting_status, perimeter_net_status,
      friction_test_result, overall_status, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      facility_id, facility_name, inspection_date, inspector_name,
      helideck_condition, lighting_status, perimeter_net_status,
      friction_test_result, overall_status, notes, req.user.id
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create inspection' });
      }
      
      const inspectionId = this.lastID;
      
      // Handle file attachments
      if (req.files && req.files.length > 0) {
        const attachmentPromises = req.files.map(file => {
          return new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO attachments (inspection_id, filename, original_name, mimetype, size, path) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [inspectionId, file.filename, file.originalname, file.mimetype, file.size, file.path],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        });
        
        Promise.all(attachmentPromises)
          .then(() => {
            res.json({ id: inspectionId, message: 'Inspection created successfully' });
          })
          .catch(() => {
            res.status(500).json({ error: 'Failed to save attachments' });
          });
      } else {
        res.json({ id: inspectionId, message: 'Inspection created successfully' });
      }
    }
  );
});

// Update inspection
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
  const values = fields.map(field => updates[field]);
  values.push(id);
  
  const query = `UPDATE inspections SET ${fields.map(f => f + ' = ?').join(', ')} WHERE id = ?`;
  
  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update inspection' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    res.json({ message: 'Inspection updated successfully' });
  });
});

// Delete inspection
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM inspections WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete inspection' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    res.json({ message: 'Inspection deleted successfully' });
  });
});

module.exports = router;