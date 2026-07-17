const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const TypeAffaire = require('./src/models/TypeAffaire');

const typesAffaire = [
  {
    nom: 'Droit de la famille',
    categorie: 'famille',
    description: 'Litiges et procédures relatifs au droit de la famille : divorce, garde d\'enfants, pension alimentaire.',
    delaisMoyens: 180,
    juridictionCompetente: 'Tribunal judiciaire — Juge aux affaires familiales',
    piecesRequises: ['contrat', 'jugement', 'correspondance'],
    sousTypes: [
      { nom: 'Divorce contentieux', description: 'Divorce prononcé pour faute ou altération définitive du lien conjugal', delaisMoyens: 240, piecesRequises: ['plainte', 'contrat', 'correspondance'], juridictionCompetente: 'Tribunal judiciaire — JAF' },
      { nom: 'Divorce par consentement mutuel', description: 'Divorce par accord mutuel devant notaire', delaisMoyens: 60, piecesRequises: ['contrat'], juridictionCompetente: 'Notaire' },
      { nom: 'Garde d\'enfants', description: 'Fixation de la résidence et du droit de visite des enfants', delaisMoyens: 120, piecesRequises: ['requete', 'jugement'], juridictionCompetente: 'Tribunal judiciaire — JAF' },
      { nom: 'Pension alimentaire', description: 'Demande de pension pour l\'entretien des enfants ou du conjoint', delaisMoyens: 90, piecesRequises: ['requete', 'jugement'], juridictionCompetente: 'Tribunal judiciaire — JAF' },
      { nom: 'Adoption', description: 'Procédure d\'adoption simple ou plénière', delaisMoyens: 300, piecesRequises: ['requete', 'jugement'], juridictionCompetente: 'Tribunal judiciaire' }
    ],
    relations: ['Droit des successions']
  },
  {
    nom: 'Droit pénal',
    categorie: 'penal',
    description: 'Infractions pénales : vol, meurtre, viol, agression, escroquerie, drogues, criminalité, homicide, coups et blessures.',
    delaisMoyens: 365,
    juridictionCompetente: 'Tribunal correctionnel / Cour d\'assises',
    piecesRequises: ['plainte', 'jugement', 'pouvoir'],
    sousTypes: [
      { nom: 'Défense pénale', description: 'Défense d\'une personne poursuivie pénalement pour vol, agression, meurtre ou infraction', delaisMoyens: 365, piecesRequises: ['pouvoir', 'jugement'], juridictionCompetente: 'Tribunal correctionnel' },
      { nom: 'Partie civile', description: 'Constitution de partie civile pour obtenir réparation après une infraction pénale', delaisMoyens: 240, piecesRequises: ['plainte', 'jugement'], juridictionCompetente: 'Tribunal correctionnel' },
      { nom: 'Appel pénal', description: 'Appel d\'une décision pénale rendue en correctionnel ou cour d\'assises', delaisMoyens: 180, piecesRequises: ['jugement', 'requete'], juridictionCompetente: 'Cour d\'appel — Chambre correctionnelle' }
    ],
    relations: ['Droit civil / des contrats']
  },
  {
    nom: 'Droit commercial',
    categorie: 'commercial',
    description: 'Droit des sociétés, contrats commerciaux, procédures collectives.',
    delaisMoyens: 150,
    juridictionCompetente: 'Tribunal de commerce',
    piecesRequises: ['contrat', 'facture', 'correspondance'],
    sousTypes: [
      { nom: 'Contentieux commercial', description: 'Litige entre commerçants', delaisMoyens: 180, piecesRequises: ['contrat', 'facture', 'correspondance'], juridictionCompetente: 'Tribunal de commerce' },
      { nom: 'Rédaction de statuts', description: 'Rédaction et modification des statuts d\'une société', delaisMoyens: 30, piecesRequises: ['contrat'], juridictionCompetente: 'Cabinet / Notaire' },
      { nom: 'Procédure collective', description: 'Sauvegarde, redressement ou liquidation judiciaire', delaisMoyens: 365, piecesRequises: ['requete', 'jugement', 'correspondance'], juridictionCompetente: 'Tribunal de commerce' },
      { nom: 'Cession de fonds de commerce', description: 'Achat / vente d\'un fonds de commerce', delaisMoyens: 90, piecesRequises: ['contrat', 'facture'], juridictionCompetente: 'Cabinet / Notaire' }
    ],
    relations: ['Droit bancaire', 'Droit immobilier']
  },
  {
    nom: 'Droit du travail',
    categorie: 'travail',
    description: 'Relations individuelles et collectives du travail, contentieux prud\'homal.',
    delaisMoyens: 210,
    juridictionCompetente: 'Conseil de prud\'hommes',
    piecesRequises: ['contrat', 'correspondance', 'jugement'],
    sousTypes: [
      { nom: 'Licenciement', description: 'Contestation d\'un licenciement', delaisMoyens: 240, piecesRequises: ['contrat', 'correspondance', 'requete'], juridictionCompetente: 'Conseil de prud\'hommes' },
      { nom: 'Harcèlement', description: 'Harcèlement moral ou sexuel au travail', delaisMoyens: 300, piecesRequises: ['correspondance', 'plainte', 'jugement'], juridictionCompetente: 'Conseil de prud\'hommes' },
      { nom: 'Transaction', description: 'Négociation et rédaction d\'une rupture conventionnelle', delaisMoyens: 30, piecesRequises: ['contrat'], juridictionCompetente: 'Cabinet' },
      { nom: 'Contentieux salarial', description: 'Demande de rappel de salaire, primes, heures sup', delaisMoyens: 180, piecesRequises: ['contrat', 'facture', 'correspondance'], juridictionCompetente: 'Conseil de prud\'hommes' }
    ],
    relations: ['Droit civil / des contrats']
  },
  {
    nom: 'Droit immobilier',
    categorie: 'immobilier',
    description: 'Droit de la construction, baux d\'habitation et commerciaux, copropriété.',
    delaisMoyens: 180,
    juridictionCompetente: 'Tribunal judiciaire / Tribunal de commerce',
    piecesRequises: ['contrat', 'facture', 'jugement'],
    sousTypes: [
      { nom: 'Bail d\'habitation', description: 'Litige entre bailleur et locataire', delaisMoyens: 120, piecesRequises: ['contrat', 'correspondance', 'jugement'], juridictionCompetente: 'Tribunal judiciaire' },
      { nom: 'Bail commercial', description: 'Renouvellement, résiliation ou fixation de loyer commercial', delaisMoyens: 240, piecesRequises: ['contrat', 'facture', 'jugement'], juridictionCompetente: 'Tribunal judiciaire — Juge des loyers' },
      { nom: 'Copropriété', description: 'Litiges de copropriété', delaisMoyens: 180, piecesRequises: ['contrat', 'correspondance', 'requete'], juridictionCompetente: 'Tribunal judiciaire' },
      { nom: 'Vente immobilière', description: 'Promesse de vente, vente, contentieux', delaisMoyens: 60, piecesRequises: ['contrat'], juridictionCompetente: 'Notaire / Tribunal judiciaire' }
    ],
    relations: ['Droit commercial', 'Droit civil / des contrats']
  },
  {
    nom: 'Droit administratif',
    categorie: 'administratif',
    description: 'Contentieux avec l\'administration, fonction publique, marchés publics.',
    delaisMoyens: 300,
    juridictionCompetente: 'Tribunal administratif',
    piecesRequises: ['requete', 'jugement', 'correspondance'],
    sousTypes: [
      { nom: 'Contentieux administratif', description: 'Recours contre une décision administrative', delaisMoyens: 300, piecesRequises: ['requete', 'jugement', 'correspondance'], juridictionCompetente: 'Tribunal administratif' },
      { nom: 'Fonction publique', description: 'Droit de la fonction publique', delaisMoyens: 240, piecesRequises: ['correspondance', 'requete', 'jugement'], juridictionCompetente: 'Tribunal administratif' },
      { nom: 'Marchés publics', description: 'Contentieux des marchés publics', delaisMoyens: 180, piecesRequises: ['contrat', 'requete', 'jugement'], juridictionCompetente: 'Tribunal administratif' }
    ],
    relations: ['Droit civil / des contrats']
  },
  {
    nom: 'Droit bancaire',
    categorie: 'bancaire',
    description: 'Contentieux bancaire, crédits, surendettement, comptes.',
    delaisMoyens: 150,
    juridictionCompetente: 'Tribunal judiciaire',
    piecesRequises: ['contrat', 'facture', 'correspondance'],
    sousTypes: [
      { nom: 'Contentieux bancaire', description: 'Litige avec une banque', delaisMoyens: 150, piecesRequises: ['contrat', 'facture', 'correspondance'], juridictionCompetente: 'Tribunal judiciaire' },
      { nom: 'Surendettement', description: 'Procédure de surendettement', delaisMoyens: 180, piecesRequises: ['requete', 'jugement', 'facture'], juridictionCompetente: 'Commission de surendettement' },
      { nom: 'Crédit immobilier', description: 'Litige relatif au crédit immobilier', delaisMoyens: 180, piecesRequises: ['contrat', 'facture'], juridictionCompetente: 'Tribunal judiciaire' }
    ],
    relations: ['Droit commercial', 'Droit immobilier']
  },
  {
    nom: 'Droit civil / des contrats',
    categorie: 'civil',
    description: 'Droit des obligations, responsabilité civile, contrats, voisinage.',
    delaisMoyens: 210,
    juridictionCompetente: 'Tribunal judiciaire',
    piecesRequises: ['contrat', 'correspondance', 'jugement'],
    sousTypes: [
      { nom: 'Responsabilité civile', description: 'Dommages et intérêts pour préjudice', delaisMoyens: 240, piecesRequises: ['correspondance', 'requete', 'jugement'], juridictionCompetente: 'Tribunal judiciaire' },
      { nom: 'Contentieux contractuel', description: 'Exécution ou résiliation d\'un contrat', delaisMoyens: 180, piecesRequises: ['contrat', 'correspondance'], juridictionCompetente: 'Tribunal judiciaire' },
      { nom: 'Troubles de voisinage', description: 'Nuisances entre voisins', delaisMoyens: 120, piecesRequises: ['correspondance', 'requete'], juridictionCompetente: 'Tribunal judiciaire' }
    ],
    relations: ['Droit immobilier', 'Droit commercial']
  },
  {
    nom: 'Droit des successions',
    categorie: 'famille',
    description: 'Successions, testaments, partages, donations.',
    delaisMoyens: 210,
    juridictionCompetente: 'Tribunal judiciaire — Juge des successions',
    piecesRequises: ['jugement', 'contrat', 'requete'],
    sousTypes: [
      { nom: 'Succession contentieuse', description: 'Litige successoral', delaisMoyens: 300, piecesRequises: ['jugement', 'requete', 'correspondance'], juridictionCompetente: 'Tribunal judiciaire' },
      { nom: 'Testament', description: 'Rédaction et homologation d\'un testament', delaisMoyens: 60, piecesRequises: ['contrat'], juridictionCompetente: 'Notaire' },
      { nom: 'Donation', description: 'Donation entre vifs', delaisMoyens: 30, piecesRequises: ['contrat'], juridictionCompetente: 'Notaire' }
    ],
    relations: ['Droit de la famille']
  }
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/avocat-pro';
    await mongoose.connect(uri);
    console.log('Connecté à MongoDB');

    await TypeAffaire.deleteMany({});
    console.log('Anciennes données supprimées');

    const result = await TypeAffaire.insertMany(typesAffaire);
    console.log(`${result.length} types d'affaire insérés`);

    // Remplir les relations avec les ObjectIds réels
    for (const doc of result) {
      const relations = doc.relations.map(nom => {
        const ref = result.find(r => r.nom === nom);
        return ref ? ref._id.toString() : null;
      }).filter(Boolean);
      if (relations.length > 0) {
        await TypeAffaire.findByIdAndUpdate(doc._id, { relations });
      }
    }

    console.log('Relations mises à jour');
    await mongoose.disconnect();
    console.log('Seed terminé');
  } catch (error) {
    console.error('Erreur seed:', error);
    process.exit(1);
  }
}

seed();
