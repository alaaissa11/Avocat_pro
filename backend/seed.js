require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const connectDB = require('./src/config/db');
const Client = require('./src/models/Client');
const Dossier = require('./src/models/Dossier');
const User = require('./src/models/User');

const frenchCities = [
  'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Monastir', 'Bizerte', 'Gabès',
  'Ariana', 'Gafsa', 'La Marsa', 'Hammamet', 'Nabeul', 'Kélibia', 'Mahdia',
  'Kasserine', 'Tataouine', 'Béja', 'Jendouba', 'Le Kef', 'Siliana'
];

const frenchStreets = [
  'Rue de la Liberté', 'Avenue Habib Bourguiba', 'Rue Mohamed V',
  'Avenue Hedi Chaker', 'Rue Emile Zola', 'Place de la République',
  'Rue du 9 Avril', 'Avenue Farhat Hached', 'Rue Taieb Slimane',
  'Boulevard de l\'Environnement'
];

const frenchLastNames = [
  'Ben Ali', 'Trabelsi', 'Khalil', 'Mabrouk', 'Chaouch', 'Ben Ammar',
  'Bouguerra', 'Ben Slimane', 'Karray', 'Boukadida', 'Ben Hassen',
  'Dakhlaoui', 'Zoghbi', 'Cherif', 'Saïd', 'Bouzaiene', 'Ghouma',
  'Riahi', 'Ben Khelil', 'Charfeddine'
];

const frenchFirstNames = [
  'Mohamed', 'Sarra', 'Mehdi', 'Nour', 'Ahmed', 'Fatma', 'Ali',
  'Amira', 'Youssef', 'Ines', 'Hichem', 'Rania', 'Omar', 'Mona',
  'Karim', 'Leila', 'Anis', 'Samira', 'Tarek', 'Nadia'
];

const frenchCompanyNames = [
  'Solutions Tech', 'Groupe Atlantique', 'Société Nord-Sud',
  'Tunisie Construction', 'Afriqua Services', 'Méditerranée Invest',
  'Union Commerciale', 'Expertise Finance', 'Innovation Plus',
  'Delta Corporation', 'Oméga Entreprises', 'Alpha Group'
];

const frenchJobTitles = [
  'directeur', 'ingénieur', 'enseignant', 'comptable', 'médecin',
  'avocat', 'architecte', 'commerçant', 'technicien', 'fonctionnaire'
];

const frenchDossierTitles = [
  'Affaire de divorce', 'Contentieux commercial', 'Litige locatif',
  'Procès pénal', 'Contrat de travail', 'Succession familiale',
  'Gestion de patrimoine', 'Réclamation d\'assurance', 'Contentieux bancaire',
  'Affaire immobilière', 'Licenciement abusif', 'Créance impayée',
  'Vice de forme', 'Dommage corporel', 'Escroquerie', 'Vol',
  'Diffamation', 'Harcèlement', 'Contestation de amende', 'Bail commercial'
];

const detailedDossiers = {
  civil: [
    { titre: 'Contentieux de divorce et garde d\'enfants', description: 'Demande en divorce pour faute avec procédure de garde partagée des deux enfants mineurs. Le demandeur allègue des comportements incompatibles avec la vie conjugale. La partie défenderesse conteste et demande une pension alimentaire substancielle. Litige portant sur la liquidation du régime matrimonial et le partage des biens communs.' },
    { titre: 'Action en responsabilité civile pour dommages corporels', description: 'Accident de la route ayant causé des blessures graves au demandeur. Fracture du bassin et traumatisme crânien. Indemnisation demandée pour frais médicaux, perte de revenus et souffrance morale. La responsabilité du défendeur est engagée pour excès de vitesse.' },
    { titre: 'Litige de bail commercial et résiliation', description: 'Contestation de la résiliation d\'un bail commercial par le propriétaire pour défaut de paiement de trois termes. Le locataire demande des dommages pour trouble de jouissance et violation du bail. Question sur la clause résolutoire et son application.' }
  ],
  penal: [
    { titre: 'Affaire d\'escroquerie et abus de confiance', description: 'Plainte pour escroquerie au préjudice d\'une entreprise. Le prédécesseur a détourné des fonds destinés à des investissements immobiliers. Détournement de 150000 dinars. Demande de constitution de partie civile et reparations.' },
    { titre: 'Poursuite pour vol avec effraction', description: 'Affaire de vol avec effraction dans un magasin. Le prévenu a été surpris en flagrant délit par les cameras de surveillance. Récidive suspectée. Le ministère public demande une peine de prison ferme.' },
    { titre: 'Affaire de trafic de stupéfiants', description: 'Interpellation pour possession de cannabis à visée de trafic. Saisie de 500 grammes de résine de cannabis. Le défendeur conteste la qualité de dealer et claim un usage personnel. Expertise chimique demandée.' }
  ],
  travail: [
    { titre: 'Licenciement pour faute grave', description: 'Contestation d\'un licenciement pour faute grave d\'un salarié ayant travaillé 10 ans dans l\'entreprise. L\'employeur allege des absences répétées et des vols sur le lieu de travail. Le salarié demande des dommages pour licenciement abusif et réintégration.' },
    { titre: 'Harcèlement moral sur le lieu de travail', description: 'Plainte pour harcèlement moral par une employée contre son supérieur hiérarchique.createur d\'un climat hostile, brimades répétées, et rétrogradation unilatérale. Demande de dommages et intérêts et reformation des conditions de travail.' },
    { titre: 'Contestation de licenciement économique', description: 'Licenciement économique contesté pour insuffisance de motivation économique réelle et sérieuse. L\'entreprise cite des pertes d\'exploitation mais le salarié conteste le plan social. Procédure de contestation de la validité du licenciement.' }
  ],
  commercial: [
    { titre: 'Litige entre actionnaires et administration de société', description: 'Conflit entre associés majoritaires et minoritaires sur la gestion d\'une société. Allégations de gestion de fait et de violation des statuts. Demande de nomination d\'un administrateur judiciaire provisoire.' },
    { titre: 'Recouvrement de créance commerciale', description: 'Factures impayées pour un montant de 80000 dinars. Mise en demeure restée sans effet. Procedure de commandement de payer et assignation en paiement devant le tribunal de commerce. Intérêts moratoires réclamés.' },
    { titre: 'Résiliation de contrat commercial pour inexécution', description: 'Résiliation unilatérale d\'un contrat de distribution exclusive. Contestation des motifs de résiliation et demande de dommages pour rupture abusive. Question sur la clause de préavis et les pénalités contractuelles.' }
  ],
  famille: [
    { titre: 'Procedure de divorce par consentement mutuel', description: 'Demande en divorce par consentement mutuel avec accord sur la garde des enfants et le partage des biens. Convention homologuée par le juge aux affaires familiales. Pension alimentaire de 800 dinars fixée pour les deux enfants.' },
    { titre: 'Contestation de filiation et demande de pension', description: 'Action en reconnaissance de paternité. Le père alleged refuse de reconnaître l\'enfant. Test ADN demandé. Demande de pension alimentaire rétroactive depuis la naissance de l\'enfant.' },
    { titre: 'Succession et partage de patrimoine', description: 'Ouverture de succession suite au décès d\'un père de famille. Trois héritiers en conflit sur le partage des biens immobiliers. Estimation des biens et demande de procéder au partage équitable.' }
  ],
  immobilier: [
    { titre: 'Litige de bail residencial et expulsion', description: 'Procédure d\'expulsion pour défaut de paiement de loyer depuis six mois. Le locataire conteste le montant des arriérés et demande des délais de paiement. Proposition de règlement échelonné.' },
    { titre: 'Trouble de jouissance et voisins', description: 'Plainte pour troubles anormaux de voisinage suite à des travaux non autorisés. Modification de la façade de l\'immeuble sans autorisation de la copropriété. Demande de remise en état et dommages pour préjudice.' },
    { titre: 'Contestation de vente immobilière', description: 'Contestation d\'une vente aux enchères pour vice caché. L\'acquéreur découvre des fissures importantes non mentionnées dans l\'acte. Annulation de la vente et restitution du prix demandé.' }
  ],
  bancaire: [
    { titre: 'Contestation de frais bancaires', description: 'Contestation des frais de gestion et des commissions aplicadas sur un compte professionnel. Découverte de prélèvements non autorisés. Demande de restitution des sommes et dommages pour pratique abusive.' },
    { titre: 'Litige sur crédit immobilier', description: 'Contestation d\'un taux d\'intérêt aplicarse sur un crédit immobilier. Allégation de taux usuraire et de clause abusive. Demande de révision du contrat et restitution des intérêts indus.' },
    { titre: 'Blocage de compte et protection du consommateur', description: 'Blocage soudain d\'un compte bancaire sans motif explicación. Le client demande le déblocage immédiat et des dommages pour le préjudice causé. Question sur le droit de la consommation.' }
  ]
};

const outcomes = [
  'Décision favorable au client - gain total du procès',
  'Décision partiellement favorable - accord à l\'amiable trouvé',
  'Transaction homologuée par le tribunal',
  'Jugement défavorable mais appel en cours',
  'Dossier gagné - dommages et intérêts accordés',
  ' Médiation réussie - accord trouvé entre les parties',
  'Clôture pour désistement du client',
  'Jugement défavorable en première instance'
];

const frenchAdversaryNames = [
  'Pierre Durand', 'Jean Martin', 'Michel Bernard', 'Alain Dubois',
  'Patrick Petit', 'Jacques Robert', 'Michel Richard', 'Philippe Thomas',
  'Christian Robert', 'Francis Moreau'
];

const frenchAdversaryLawyers = [
  'Maître Sophie Laurent', 'Maître Jean Dupont', 'Maître Marie Lambert',
  'Maître Paul Martin', 'Maître Claire Fontaine', 'Maître Philippe Leroy'
];

const generateFrenchPhone = () => {
  const prefix = faker.helpers.arrayElement(['+216 2', '+216 5', '+216 9']);
  const number = faker.string.numeric(8);
  return `${prefix} ${number}`;
};

const generateFrenchZipCode = () => {
  return faker.string.numeric(4);
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    await Client.deleteMany({});
    await Dossier.deleteMany({});
    
    const clients = [];
    const clientCount = faker.number.int({ min: 20, max: 30 });
    
    for (let i = 0; i < clientCount; i++) {
      const isCompany = faker.datatype.boolean();
      const lastName = faker.helpers.arrayElement(frenchLastNames);
      const firstName = faker.helpers.arrayElement(frenchFirstNames);
      const companyName = faker.helpers.arrayElement(frenchCompanyNames);
      
      clients.push({
        nom: isCompany ? companyName : lastName,
        prenom: isCompany ? null : firstName,
        raisonSociale: isCompany ? companyName : null,
        email: isCompany 
          ? `contact@${companyName.toLowerCase().replace(/[^a-z]/g, '')}.tn`
          : faker.internet.email({ firstName, lastName }).toLowerCase(),
        telephone: generateFrenchPhone(),
        adresse: `${faker.number.int({ min: 1, max: 150 })} ${faker.helpers.arrayElement(frenchStreets)}`,
        ville: faker.helpers.arrayElement(frenchCities),
        codePostal: generateFrenchZipCode(),
        pays: 'Tunisie',
        cin: isCompany ? null : faker.string.numeric(8),
        matriculeFiscal: isCompany ? `MT${faker.string.alphanumeric(5).toUpperCase()}` : null,
        type: isCompany ? 'entreprise' : 'particulier',
        profession: isCompany ? null : faker.helpers.arrayElement(frenchJobTitles)
      });
    }
    
    const createdClients = await Client.insertMany(clients);
    console.log(`${clientCount} clients créés`);
    
    let users = await User.find();
    
    if (users.length === 0) {
      const defaultUsers = [
        { email: 'admin@avocat.com', password: 'password123', nom: 'Admin', prenom: 'Système', role: 'admin', permissions: ['read', 'write', 'delete', 'manage_users', 'manage_dossiers', 'manage_clients', 'view_stats'] },
        { email: 'avocat@avocat.com', password: 'password123', nom: 'Ben Ali', prenom: 'Mehdi', role: 'avocat', permissions: ['read', 'write', 'manage_dossiers', 'manage_clients', 'view_stats'] },
        { email: 'assistant@avocat.com', password: 'password123', nom: 'Trabelsi', prenom: 'Sarra', role: 'assistant', permissions: ['read', 'write'] },
        { email: 'secretaire@avocat.com', password: 'password123', nom: 'Khalil', prenom: 'Nour', role: 'secretaire', permissions: ['read'] }
      ];
      users = await User.insertMany(defaultUsers);
      console.log(`${users.length} utilisateurs par défaut créés`);
    }
    
    const dossiers = [];
    const dossierCount = faker.number.int({ min: 50, max: 100 });
    const typesAffaire = ['civil', 'penal', 'commercial', 'travail', 'famille', 'administratif', 'immobilier', 'bancaire', 'autre'];
    const statuts = ['nouveau', 'en_cours', 'en_attente', 'cloture', 'archive'];
    const juridictions = ['Tribunal de Première Instance', 'Tribunal de Grande Instance', 'Cour d\'Appel', 'Tribunal Administratif', 'Cour de Cassation'];
    
    for (let i = 0; i < dossierCount; i++) {
      const client = faker.helpers.arrayElement(createdClients);
      const assignedUser = users.length > 0 ? faker.helpers.arrayElement(users) : null;
      const typeAffaire = faker.helpers.arrayElement(typesAffaire);
      const isClosed = Math.random() > 0.5;
      
      let dossierData;
      if (isClosed && detailedDossiers[typeAffaire]) {
        dossierData = faker.helpers.arrayElement(detailedDossiers[typeAffaire]);
      } else {
        dossierData = {
          titre: faker.helpers.arrayElement(frenchDossierTitles),
          description: faker.helpers.arrayElement(frenchDescriptions)
        };
      }
      
      const dateCreation = faker.date.past({ years: 3 });
      const dateCloture = isClosed ? faker.date.between({ from: dateCreation, to: new Date() }) : null;
      
      dossiers.push({
        titre: dossierData.titre,
        description: dossierData.description + (isClosed ? ' ' + faker.helpers.arrayElement(outcomes) : ''),
        clientId: client._id,
        typeAffaire: typeAffaire,
        sousType: typeAffaire.toUpperCase(),
        statut: isClosed ? 'cloture' : faker.helpers.arrayElement(['nouveau', 'en_cours', 'en_attente']),
        priorite: faker.number.int({ min: 1, max: 5 }),
        assigneA: assignedUser?._id,
        collaboreurs: [],
        chargeEstimee: faker.number.int({ min: 10, max: 200 }),
        chargeConsommee: faker.number.int({ min: 0, max: 200 }),
        dateCreation: dateCreation,
        dateCloture: dateCloture,
        dateAudience: faker.date.future({ years: 2 }),
        numeroRG: `RG-${faker.string.numeric(6)}`,
        juridiction: faker.helpers.arrayElement(juridictions),
        adversary: {
          nom: faker.helpers.arrayElement(frenchAdversaryNames),
          avocat: faker.helpers.arrayElement(frenchAdversaryLawyers),
          email: faker.internet.email().toLowerCase()
        },
        historique: [],
        createdBy: assignedUser?._id
      });
    }
    
    let dossierNum = 1;
    for (const dossier of dossiers) {
      dossier.numero = `DOS-${new Date().getFullYear()}-${String(dossierNum++).padStart(5, '0')}`;
    }
    await Dossier.insertMany(dossiers);
    console.log(`${dossierCount} dossiers créés`);
    
    console.log('Alimentation terminée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
};

seedDatabase();