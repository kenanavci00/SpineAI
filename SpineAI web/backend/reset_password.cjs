const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spineai';

async function resetPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    const email = 'oktarnisa23@gmail.com';
    const newPassword = '12345678';
    
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
    } else {
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
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
