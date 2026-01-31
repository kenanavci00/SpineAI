const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spineai';

async function createTestUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Reset password for oktarnisa23@gmail.com
    const email = 'oktarnisa23@gmail.com';
    const newPassword = '123456';
    
    const existingUser = await User.findOne({ email: email });
    
    if (existingUser) {
      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      existingUser.password = hashedPassword;
      await existingUser.save();
      
      console.log('✅ Password reset successfully!');
      console.log('');
      console.log('Login credentials:');
      console.log('Email:', email);
      console.log('Password:', newPassword);
      console.log('');
      process.exit(0);
    }

    // Create user if doesn't exist
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const newUser = new User({
      username: 'nisa',
      email: email,
      password: hashedPassword
    });

    await newUser.save();
    
    console.log('✅ User created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Email:', email);
    console.log('Password:', newPassword);
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
}

createTestUser();
