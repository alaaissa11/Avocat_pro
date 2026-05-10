const app = require('./app');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
  });
});