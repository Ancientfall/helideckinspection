const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Predefined facilities (matching your frontend)
const facilities = [
  { id: 'Atlantis', name: 'Atlantis', location: 'Gulf of Mexico', operator: 'BP' },
  { id: 'Argos', name: 'Argos', location: 'North Sea', operator: 'BP' },
  { id: 'Mad Dog', name: 'Mad Dog', location: 'Gulf of Mexico', operator: 'BP' },
  { id: 'Thunder Horse', name: 'Thunder Horse', location: 'Gulf of Mexico', operator: 'BP' },
  { id: 'Na Kika', name: 'Na Kika', location: 'Gulf of Mexico', operator: 'BP' },
  { id: 'Neptune', name: 'Neptune', location: 'Gulf of Mexico', operator: 'Oceaneering' },
  { id: 'Valkyrie', name: 'Valkyrie', location: 'North Sea', operator: 'BP' },
  { id: 'Huldra', name: 'Huldra', location: 'North Sea', operator: 'Equinor' },
  { id: 'Sleipner', name: 'Sleipner', location: 'North Sea', operator: 'Equinor' }
];

// Get all facilities
router.get('/', authenticateToken, (req, res) => {
  res.json(facilities);
});

// Get facility by ID
router.get('/:id', authenticateToken, (req, res) => {
  const facility = facilities.find(f => f.id === req.params.id);
  if (!facility) {
    return res.status(404).json({ error: 'Facility not found' });
  }
  res.json(facility);
});

module.exports = router;