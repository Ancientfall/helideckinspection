const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Get command line arguments
const [,, username, newRole] = process.argv;

if (!username || !newRole) {
  console.log('Usage: node update-user-role.js <username> <role>');
  console.log('Available roles: admin, bp, hlo, supplier');
  process.exit(1);
}

// Valid roles
const validRoles = ['admin', 'bp', 'hlo', 'supplier'];
if (!validRoles.includes(newRole)) {
  console.error(`Error: Invalid role. Must be one of: ${validRoles.join(', ')}`);
  process.exit(1);
}

// Connect to database
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
});

// Update user role
db.run(
  'UPDATE users SET role = ? WHERE username = ?',
  [newRole, username],
  function(err) {
    if (err) {
      console.error('Error updating user role:', err);
      db.close();
      process.exit(1);
    }

    if (this.changes === 0) {
      console.error(`User '${username}' not found`);
      db.close();
      process.exit(1);
    }

    console.log(`Successfully updated user '${username}' to role '${newRole}'`);
    
    // Verify the update
    db.get(
      'SELECT username, email, role FROM users WHERE username = ?',
      [username],
      (err, row) => {
        if (err) {
          console.error('Error verifying update:', err);
        } else {
          console.log('\nUser details:');
          console.log(`- Username: ${row.username}`);
          console.log(`- Email: ${row.email}`);
          console.log(`- Role: ${row.role}`);
        }
        db.close();
      }
    );
  }
);