const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Test users to create
const testUsers = [
  {
    username: 'bp_user',
    email: 'bp@bp.com',
    password: 'bp123456',
    role: 'bp'
  },
  {
    username: 'hlo_user',
    email: 'hlo@offshore.com',
    password: 'hlo123456',
    role: 'hlo'
  },
  {
    username: 'supplier_user',
    email: 'supplier@bmt.com',
    password: 'supplier123456',
    role: 'supplier'
  }
];

// Connect to database
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Create users
async function createTestUsers() {
  for (const user of testUsers) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Insert user
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          [user.username, user.email, hashedPassword, user.role],
          function(err) {
            if (err) {
              if (err.code === 'SQLITE_CONSTRAINT') {
                console.log(`User ${user.username} already exists`);
                resolve();
              } else {
                reject(err);
              }
            } else {
              console.log(`Created user: ${user.username} (${user.role})`);
              resolve();
            }
          }
        );
      });
    } catch (error) {
      console.error(`Error creating user ${user.username}:`, error);
    }
  }
  
  // Display all users
  console.log('\nAll users in system:');
  db.all('SELECT username, email, role FROM users', (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
    } else {
      console.table(rows);
    }
    db.close();
  });
}

createTestUsers();