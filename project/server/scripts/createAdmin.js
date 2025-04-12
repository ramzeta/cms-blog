import bcrypt from 'bcryptjs';
import { getDatabase } from '../database/index.js';

export async function createAdminUser() {
  try {
    const db = await getDatabase();
    
    // Default admin credentials
    const name = 'Admin User';
    const email = 'admin@example.com';
    const password = 'admin123';
    const role = 'admin';
    
    // Check if admin user already exists
    const existingAdmin = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!existingAdmin) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert admin user
      await db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
      console.log('Admin user created successfully');
      console.log('Email:', email);
      console.log('Password:', password);
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}