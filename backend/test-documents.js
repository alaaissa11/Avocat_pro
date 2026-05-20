const mongoose = require('mongoose');
const Document = require('./src/models/Document');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/avocat-pro');
  
  const testDossierId = '6a0a4ec7336c0bf0aea5d2fd';
  
  const docs = await Document.find({ dossierId: testDossierId });
  console.log('Documents for dossier', testDossierId + ':', docs.length);
  docs.forEach(d => console.log('  -', d.nom, '(', d._id, ')'));
  
  process.exit();
}
test();