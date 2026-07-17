const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
require('dotenv').config();
const bcrypt = require('bcryptjs');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/avocat-pro');
  const users = await mongoose.connection.db.collection('users').find({}).project({ email: 1, role: 1, password: 1 }).toArray();
  const tests = ['password123', 'admin123', 'pass123', '123456', 'avocat123'];
  for (const user of users) {
    for (const pwd of tests) {
      const match = await bcrypt.compare(pwd, user.password);
      if (match) console.log(user.email, '-> password =', pwd);
    }
  }
  await mongoose.disconnect();
}
check().catch(console.error);
