#!/usr/bin/env node

require('dotenv').config();
const bcrypt = require('bcryptjs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { ROLES } = require('../src/constants/roles');

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node create-admin.js <username> <email> <password>');
  console.log('Example: node create-admin.js admin admin@example.com mypassword');
  process.exit(1);
}

const [username, email, password] = args;

// Connect to database
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

// Create admin user
async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, ROLES.ADMIN],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            console.error('Error: Username or email already exists');
          } else {
            console.error('Error creating admin user:', err.message);
          }
          db.close();
          process.exit(1);
        }
        
        console.log('Admin user created successfully!');
        console.log('Username:', username);
        console.log('Email:', email);
        console.log('Role:', ROLES.ADMIN);
        console.log('User ID:', this.lastID);
        
        db.close();
        process.exit(0);
      }
    );
  } catch (error) {
    console.error('Error hashing password:', error);
    db.close();
    process.exit(1);
  }
}

createAdminUser();