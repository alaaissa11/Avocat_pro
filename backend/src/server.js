const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

connectDB().then(async () => {
  // Migration : les utilisateurs dont ownerId est un admin doivent avoir ownerId: null
  try {
    const adminUsers = await User.find({ role: 'admin' }).select('_id').lean();
    const adminIds = adminUsers.map(a => a._id);
    if (adminIds.length > 0) {
      const result = await User.updateMany(
        { ownerId: { $in: adminIds } },
        { $set: { ownerId: null } }
      );
      if (result.modifiedCount > 0) {
        console.log(`Migration: ${result.modifiedCount} utilisateurs détachés des administrateurs.`);
      }
    }
  } catch (err) {
    console.error('Migration error:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
  });
});