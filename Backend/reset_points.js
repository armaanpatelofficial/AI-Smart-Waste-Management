const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./Models/User');

const resetPoints = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in .env');
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const result = await User.updateMany({}, { 
      $set: { 
        swachhPoints: 0, 
        level: 'Bronze',
        totalScans: 0
      } 
    });

    console.log(`✨ Successfully reset points for ${result.modifiedCount} users!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error resetting points:', err);
    process.exit(1);
  }
};

resetPoints();
