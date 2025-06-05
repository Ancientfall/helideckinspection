const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all helicards
router.get('/', (req, res) => {
  const query = `
    SELECT 
      id,
      facility_name as facilityName,
      operating_company as operatingCompany,
      d_value as dValue,
      elevation,
      uploaded_by as uploadedBy,
      file_name as fileName,
      compliance_frequency_painted as frequencyPainted,
      compliance_tdpm_circle as tdpmCircle,
      compliance_lighting_system as lightingSystem,
      compliance_obstacles_free as obstaclesFree,
      last_updated as lastUpdated,
      expiry_date as expiryDate,
      version,
      status,
      created_at as createdAt
    FROM helicards
    ORDER BY created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching helicards:', err);
      return res.status(500).json({ error: 'Failed to fetch helicards' });
    }
    
    // Transform compliance data into object format
    const helicards = rows.map(row => ({
      ...row,
      compliance: {
        frequencyPainted: Boolean(row.frequencyPainted),
        tdpmCircle: Boolean(row.tdpmCircle),
        lightingSystem: Boolean(row.lightingSystem),
        obstaclesFree: Boolean(row.obstaclesFree)
      }
    }));
    
    res.json(helicards);
  });
});

// Get single helicard
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      id,
      facility_name as facilityName,
      operating_company as operatingCompany,
      d_value as dValue,
      elevation,
      uploaded_by as uploadedBy,
      file_name as fileName,
      file_data as fileData,
      compliance_frequency_painted as frequencyPainted,
      compliance_tdpm_circle as tdpmCircle,
      compliance_lighting_system as lightingSystem,
      compliance_obstacles_free as obstaclesFree,
      last_updated as lastUpdated,
      expiry_date as expiryDate,
      version,
      status,
      created_at as createdAt
    FROM helicards
    WHERE id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching helicard:', err);
      return res.status(500).json({ error: 'Failed to fetch helicard' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Helicard not found' });
    }
    
    // Transform compliance data into object format
    const helicard = {
      ...row,
      compliance: {
        frequencyPainted: Boolean(row.frequencyPainted),
        tdpmCircle: Boolean(row.tdpmCircle),
        lightingSystem: Boolean(row.lightingSystem),
        obstaclesFree: Boolean(row.obstaclesFree)
      }
    };
    
    res.json(helicard);
  });
});

// Create new helicard
router.post('/', (req, res) => {
  console.log('Received helicard upload request');
  console.log('Request body keys:', Object.keys(req.body));
  
  const {
    facilityName,
    operatingCompany,
    dValue,
    elevation,
    uploadedBy,
    fileName,
    fileData,
    compliance,
    lastUpdated,
    expiryDate,
    version,
    status
  } = req.body;
  
  console.log('Parsed data:', {
    facilityName,
    operatingCompany,
    hasFileData: !!fileData,
    fileDataLength: fileData ? fileData.length : 0,
    compliance
  });
  
  const query = `
    INSERT INTO helicards (
      facility_name,
      operating_company,
      d_value,
      elevation,
      uploaded_by,
      file_name,
      file_data,
      compliance_frequency_painted,
      compliance_tdpm_circle,
      compliance_lighting_system,
      compliance_obstacles_free,
      last_updated,
      expiry_date,
      version,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    facilityName,
    operatingCompany,
    dValue,
    elevation,
    uploadedBy,
    fileName,
    fileData,
    compliance.frequencyPainted ? 1 : 0,
    compliance.tdpmCircle ? 1 : 0,
    compliance.lightingSystem ? 1 : 0,
    compliance.obstaclesFree ? 1 : 0,
    lastUpdated,
    expiryDate,
    version,
    status
  ];
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('Error creating helicard:', err);
      return res.status(500).json({ error: 'Failed to create helicard' });
    }
    
    // Return the created helicard
    res.json({
      id: this.lastID,
      facilityName,
      operatingCompany,
      dValue,
      elevation,
      uploadedBy,
      fileName,
      compliance,
      lastUpdated,
      expiryDate,
      version,
      status
    });
  });
});

// Update helicard
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    facilityName,
    operatingCompany,
    dValue,
    elevation,
    uploadedBy,
    fileName,
    fileData,
    compliance,
    lastUpdated,
    expiryDate,
    version,
    status
  } = req.body;
  
  const query = `
    UPDATE helicards SET
      facility_name = ?,
      operating_company = ?,
      d_value = ?,
      elevation = ?,
      uploaded_by = ?,
      file_name = ?,
      file_data = ?,
      compliance_frequency_painted = ?,
      compliance_tdpm_circle = ?,
      compliance_lighting_system = ?,
      compliance_obstacles_free = ?,
      last_updated = ?,
      expiry_date = ?,
      version = ?,
      status = ?
    WHERE id = ?
  `;
  
  const params = [
    facilityName,
    operatingCompany,
    dValue,
    elevation,
    uploadedBy,
    fileName,
    fileData,
    compliance.frequencyPainted ? 1 : 0,
    compliance.tdpmCircle ? 1 : 0,
    compliance.lightingSystem ? 1 : 0,
    compliance.obstaclesFree ? 1 : 0,
    lastUpdated,
    expiryDate,
    version,
    status,
    id
  ];
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('Error updating helicard:', err);
      return res.status(500).json({ error: 'Failed to update helicard' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Helicard not found' });
    }
    
    res.json({ message: 'Helicard updated successfully' });
  });
});

// Delete helicard
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM helicards WHERE id = ?';
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting helicard:', err);
      return res.status(500).json({ error: 'Failed to delete helicard' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Helicard not found' });
    }
    
    res.json({ message: 'Helicard deleted successfully' });
  });
});

// Download helicard PDF
router.get('/:id/download', (req, res) => {
  const { id } = req.params;
  
  const query = 'SELECT file_name, file_data FROM helicards WHERE id = ?';
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching helicard file:', err);
      return res.status(500).json({ error: 'Failed to fetch helicard file' });
    }
    
    if (!row || !row.file_data) {
      return res.status(404).json({ error: 'Helicard file not found' });
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(row.file_data, 'base64');
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${row.file_name}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  });
});

module.exports = router;