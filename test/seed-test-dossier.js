try {
  require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });
} catch (_) {
  require('dotenv').config({ path: require('path').join(process.cwd(), '.env') });
}
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const connectDB = require('../backend/src/config/db');

const Client = require('../backend/src/models/Client');
const Dossier = require('../backend/src/models/Dossier');
const Document = require('../backend/src/models/Document');
const User = require('../backend/src/models/User');

function genererPDF(nom, contenu, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 40, left: 50, right: 50 } });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      doc.fontSize(14).fillColor('#1e293b').font('Helvetica-Bold');
      doc.text(nom, { align: 'center' });
      doc.moveDown(1);
      doc.fontSize(10).fillColor('#475569').font('Helvetica');
      doc.text(contenu, { align: 'justify' });
      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

(async () => {
  try {
    await connectDB();

    const existing = await Dossier.countDocuments({ titre: /TEST.*IA/ });
    if (existing > 0) {
      console.log('Des dossiers de test existent déjà. Nettoyage...');
      const dossiers = await Dossier.find({ titre: /TEST.*IA/ });
      for (const d of dossiers) {
        await Document.deleteMany({ dossierId: d._id });
        await Dossier.deleteOne({ _id: d._id });
      }
    }

    const avocat = await User.findOne({ role: 'avocat' });
    if (!avocat) {
      console.error('Aucun avocat trouvé. Lancez d\'abord: node backend/create-admin.js');
      process.exit(1);
    }

    let client = await Client.findOne({ email: 'test.ia@cabinet.tn' });
    if (!client) {
      const [newClient] = await Client.insertMany([{
        nom: 'Testeur',
        prenom: 'IA',
        email: 'test.ia@cabinet.tn',
        telephone: '+216 99 999 999',
        adresse: '42 Rue de l\'Intelligence Artificielle',
        ville: 'Tunis',
        codePostal: '1001',
        pays: 'Tunisie',
        cin: '12345678',
        type: 'particulier',
        profession: 'testeur'
      }]);
      client = newClient;
      console.log('✓ Client de test créé');
    } else {
      console.log('↻ Client de test existe déjà');
    }

    const dossiersData = [
      {
        titre: 'TEST IA - Divorce avec garde d\'enfants et pension alimentaire',
        description: 'Demande de divorce pour faute intentée par l\'épouse. Le couple est marié depuis 10 ans et a deux enfants en bas âge. Litige sur la garde exclusive, la pension alimentaire de 1500 DT par mois, et le partage de la villa conjugale à Tunis. Situation de violence psychologique alléguée. Urgence d\'une ordonnance de protection.',
        sousType: 'divorce contentieux',
        typeAffaire: 'famille'
      },
      {
        titre: 'TEST IA - Licenciement abusif et non-paiement des heures supplémentaires',
        description: 'Ancien salarié d\'une société de textile licencié après 5 ans d\'ancienneté. Il conteste son licenciement et réclame le paiement de 2 ans d\'heures supplémentaires non rémunérées. Contrat de travail CDI, salaire mensuel 1200 DT, horaires de 45h/semaine au lieu de 40h. Demande de requalification et indemnités de 18000 DT.',
        sousType: 'licenciement',
        typeAffaire: 'travail'
      },
      {
        titre: 'TEST IA - Litige commercial impayé de factures',
        description: 'Société de fourniture de matériel de construction réclame le paiement de trois factures impayées totalisant 75000 DT à une SARL de promotion immobilière. Contrats de vente signés, livraisons effectuées et acceptées. Mise en demeure restée sans réponse. Clause pénale de 10% et intérêts de retard contractuels. Demande d\'injonction de payer.',
        sousType: 'recouvrement',
        typeAffaire: 'commercial'
      }
    ];

    const uploadsDir = path.join(__dirname, '..', 'backend', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    let nd = 1;
    const docsData = [];
    for (const d of dossiersData) {
      const num = `TEST-${new Date().getFullYear()}-${String(nd).padStart(3, '0')}`;
      const dossier = await Dossier.create({
        numero: num,
        titre: d.titre,
        description: d.description,
        clientId: client._id,
        typeAffaire: d.typeAffaire,
        sousType: d.sousType,
        statut: 'nouveau',
        priorite: 3,
        assigneA: avocat._id,
        juridiction: 'Tribunal de Première Instance de Tunis',
        createdBy: avocat._id,
        historique: [{ action: 'creation', userId: avocat._id, date: new Date(), details: `Dossier test ${num} créé` }]
      });
      console.log(`  ✓ ${num} - ${d.titre}`);

      const pdfName = `DOC_TEST_${dossier.numero}.pdf`;
      const pdfPath = path.join(uploadsDir, pdfName);
      await genererPDF(
        `Document de test - ${d.titre}`,
        `Ce document est associé au dossier ${dossier.numero}.\n\n${d.description}`,
        pdfPath
      );
      docsData.push({
        nom: pdfName,
        description: `Document test pour ${dossier.numero}`,
        type: 'piece_jointe',
        mimeType: 'application/pdf',
        chemin: `uploads/${pdfName}`,
        taille: fs.statSync(pdfPath).size,
        dossierId: dossier._id,
        clientId: client._id,
        uploadedBy: avocat._id,
        tags: [d.typeAffaire, 'test', dossier.numero],
        version: 1
      });
      nd++;
    }

    await Document.insertMany(docsData);
    console.log(`✓ ${docsData.length} documents PDF créés`);

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  Données de test prêtes !');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📋 Pour tester l\'IA de suggestion de type :');
    console.log('  1. Lancez le backend  : node backend/server.js');
    console.log('  2. Lancez le frontend : cd frontend && npm start');
    console.log('  3. Connectez-vous avec un compte existant');
    console.log('  4. Allez dans "Nouveau Dossier"');
    console.log('  5. Tapez un titre ET une description (min 10 car.)');
    console.log('\n📝 Exemples de textes à tester :');
    console.log('  • "divorce garde enfants pension"');
    console.log('  • "licenciement abusif heures sup"');
    console.log('  • "impayé facture commercial recouvrement"');
    console.log('  • "accident voiture dommages corporels"');
    console.log('\n🔹 Les 3 dossiers de test ci-dessus apparaîtront');
    console.log('   dans la liste des dossiers une fois créés.\n');

    process.exit(0);
  } catch (err) {
    console.error('Erreur :', err.message);
    process.exit(1);
  }
})();
