const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    console.log('Tentative de connexion à MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;