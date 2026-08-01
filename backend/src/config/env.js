require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/avocat-pro',
  jwt: {
    secret: process.env.JWT_SECRET || 'avocat-pro-secret-key-2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'AVOCAT-PRO <no-reply@avocat-pro.tn>',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200'
  }
};