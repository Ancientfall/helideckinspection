const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all helideck plates
router.get('/', (req, res) => {
  const query = `
    SELECT 
      id,
      facility_name as facilityName,
      operating_company as operatingCompany,
      d_value as dValue,
      elevation,
      tonnage,
      fuel,
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
    FROM helideck_plates
    ORDER BY created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching helideck plates:', err);
      return res.status(500).json({ error: 'Failed to fetch helideck plates' });
    }
    
    // Transform compliance data into object format
    const helideckPlates = rows.map(row => ({
      ...row,
      compliance: {
        frequencyPainted: Boolean(row.frequencyPainted),
        tdpmCircle: Boolean(row.tdpmCircle),
        lightingSystem: Boolean(row.lightingSystem),
        obstaclesFree: Boolean(row.obstaclesFree)
      }
    }));
    
    res.json(helideckPlates);
  });
});

// Get single helideck plate
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      id,
      facility_name as facilityName,
      operating_company as operatingCompany,
      d_value as dValue,
      elevation,
      tonnage,
      fuel,
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
    FROM helideck_plates
    WHERE id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching helideck plate:', err);
      return res.status(500).json({ error: 'Failed to fetch helideck plate' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Helideck plate not found' });
    }
    
    // Transform compliance data into object format
    const helideckPlate = {
      ...row,
      compliance: {
        frequencyPainted: Boolean(row.frequencyPainted),
        tdpmCircle: Boolean(row.tdpmCircle),
        lightingSystem: Boolean(row.lightingSystem),
        obstaclesFree: Boolean(row.obstaclesFree)
      }
    };
    
    res.json(helideckPlate);
  });
});

// Create new helideck plate
router.post('/', (req, res) => {
  console.log('Received helideck plate upload request');
  console.log('Request body keys:', Object.keys(req.body));
  
  const {
    facilityName,
    operatingCompany,
    dValue,
    elevation,
    tonnage,
    fuel,
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
    INSERT INTO helideck_plates (
      facility_name,
      operating_company,
      d_value,
      elevation,
      tonnage,
      fuel,
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    facilityName,
    operatingCompany,
    dValue,
    elevation,
    tonnage,
    fuel,
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
      console.error('Error creating helideck plate:', err);
      return res.status(500).json({ error: 'Failed to create helideck plate' });
    }
    
    // Return the created helideck plate
    res.json({
      id: this.lastID,
      facilityName,
      operatingCompany,
      dValue,
      elevation,
      tonnage,
      fuel,
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

// Update helideck plate
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    facilityName,
    operatingCompany,
    dValue,
    elevation,
    tonnage,
    fuel,
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
    UPDATE helideck_plates SET
      facility_name = ?,
      operating_company = ?,
      d_value = ?,
      elevation = ?,
      tonnage = ?,
      fuel = ?,
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
    tonnage,
    fuel,
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
      console.error('Error updating helideck plate:', err);
      return res.status(500).json({ error: 'Failed to update helideck plate' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Helideck plate not found' });
    }
    
    res.json({ message: 'Helideck plate updated successfully' });
  });
});

// Delete helideck plate
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM helideck_plates WHERE id = ?';
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error deleting helideck plate:', err);
      return res.status(500).json({ error: 'Failed to delete helideck plate' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Helideck plate not found' });
    }
    
    res.json({ message: 'Helideck plate deleted successfully' });
  });
});

// Download helideck plate PDF
router.get('/:id/download', (req, res) => {
  const { id } = req.params;
  
  const query = 'SELECT file_name, file_data FROM helideck_plates WHERE id = ?';
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Error fetching helideck plate file:', err);
      return res.status(500).json({ error: 'Failed to fetch helideck plate file' });
    }
    
    if (!row || !row.file_data) {
      return res.status(404).json({ error: 'Helideck plate file not found' });
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