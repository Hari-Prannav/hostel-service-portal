const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany(); // Clear existing users

    await User.create([
      {
        name: 'Admin User',
        email: 'admin@vit.edu',
        password: 'password123',
        role: 'admin',
      },
      {
        name: 'Hari Student',
        email: 'hari@vit.edu',
        password: 'password123',
        role: 'student',
      },
      {
        name: 'SIC Manager',
        email: 'sic@vit.edu',
        password: 'password123',
        role: 'sic',
      }
    ]);

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();