const db = require('../database');

// Existing facilities data
const facilities = [
  { name: 'Atlantis', location: 'GOM - Gulf of Mexico', operator: 'BP' },
  { name: 'Argos', location: 'GOM - Gulf of Mexico', operator: 'BP' },
  { name: 'Mad Dog', location: 'GOM - Gulf of Mexico', operator: 'BP' },
  { name: 'Thunder Horse', location: 'GOM - Gulf of Mexico', operator: 'BP' },
  { name: 'Na Kika', location: 'GOM - Gulf of Mexico', operator: 'BP' },
  { name: 'Neptune', location: 'GOM - Gulf of Mexico', operator: 'Valaris' },
  { name: 'Valkyrie', location: 'GOM - Gulf of Mexico', operator: 'Seadrill' },
  { name: 'Huldra', location: 'North Sea - Norway', operator: 'Equinor' },
  { name: 'Sleipner', location: 'North Sea - Norway', operator: 'Equinor' }
];

// Migrate facilities to database
function migrateFacilities() {
  console.log('Starting facilities migration...');
  
  db.serialize(() => {
    // Prepare insert statement
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO facilities (name, location, operator, type, status)
      VALUES (?, ?, ?, 'Fixed', 'Active')
    `);

    // Insert each facility
    facilities.forEach(facility => {
      stmt.run(facility.name, facility.location, facility.operator, (err) => {
        if (err) {
          console.error(`Error inserting facility ${facility.name}:`, err);
        } else {
          console.log(`Migrated facility: ${facility.name}`);
        }
      });
    });

    // Finalize statement
    stmt.finalize((err) => {
      if (err) {
        console.error('Error finalizing statement:', err);
      } else {
        console.log('Facilities migration completed successfully');
      }
      
      // Verify migration
      db.all('SELECT * FROM facilities', (err, rows) => {
        if (err) {
          console.error('Error verifying migration:', err);
        } else {
          console.log(`Total facilities in database: ${rows.length}`);
          rows.forEach(row => {
            console.log(`- ${row.name} (${row.location}) - ${row.operator}`);
          });
        }
        
        // Close database connection
        db.close();
      });
    });
  });
}

// Run migration
migrateFacilities();