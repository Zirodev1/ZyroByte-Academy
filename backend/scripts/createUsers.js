// Script to create test users for development
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Create users
const createUsers = async () => {
  try {
    // Create a regular test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });
    
    // Create an admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@zyrobyte.com',
      password: 'admin123',
      role: 'admin'
    });

    // Check if users already exist
    const existingTestUser = await User.findOne({ email: 'test@example.com' });
    const existingAdminUser = await User.findOne({ email: 'admin@zyrobyte.com' });

    let results = [];

    if (existingTestUser) {
      console.log('Test user already exists');
      results.push({ user: 'test@example.com', status: 'Already exists' });
    } else {
      await testUser.save();
      console.log('Test user created successfully');
      results.push({ user: 'test@example.com', status: 'Created', password: 'password123' });
    }

    if (existingAdminUser) {
      console.log('Admin user already exists');
      results.push({ user: 'admin@zyrobyte.com', status: 'Already exists' });
    } else {
      await adminUser.save();
      console.log('Admin user created successfully');
      results.push({ user: 'admin@zyrobyte.com', status: 'Created', password: 'admin123' });
    }

    return results;
  } catch (error) {
    console.error('Error creating users:', error);
    return { error: error.message };
  }
};

// Main function
const main = async () => {
  await connectDB();
  const results = await createUsers();
  console.log('\nUser Creation Results:');
  console.table(results);
  
  // Disconnect from MongoDB
  await mongoose.connection.close();
  console.log('MongoDB disconnected');
};

// Run the script
main(); 