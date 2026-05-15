const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/avocat-pro').then(async () => {
  const User = require('./src/models/User');
  const user = await User.findOne({});
  console.log('User:', JSON.stringify(user, null, 2));
  process.exit(0);
});