// Script to test the login functionality
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
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

// Test login function
const testLogin = async (email, password) => {
  try {
    console.log(`Attempting to login with email: ${email}`);
    
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found');
      return { success: false, message: 'User not found' };
    }
    
    console.log('User found:', { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role
    });
    
    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Invalid password');
      return { success: false, message: 'Invalid password' };
    }
    
    console.log('Login successful');
    return { success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: error.message };
  }
};

// Test users
const users = [
  { email: 'test@example.com', password: 'password123' },
  { email: 'admin@zyrobyte.com', password: 'admin123' }
];

// Main function
const main = async () => {
  await connectDB();
  
  console.log('\nTesting login functionality...\n');
  
  for (const user of users) {
    console.log(`\n=== Testing ${user.email} ===`);
    const result = await testLogin(user.email, user.password);
    console.log('Result:', result);
  }
  
  // Disconnect from MongoDB
  await mongoose.connection.close();
  console.log('\nMongoDB disconnected');
};

// Run the script
main(); 