require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { faker } = require('@faker-js/faker');
const connectDB = require('./src/config/db');

const Client = require('./src/models/Client');
const Dossier = require('./src/models/Dossier');
const User = require('./src/models/User');
const Tache = require('./src/models/Tache');
const Facture = require('./src/models/Facture');
const Document = require('./src/models/Document');
const Calendrier = require('./src/models/Calendrier');
const Collaborateur = require('./src/models/Collaborateur');
const Parametrage = require('./src/models/Parametrage');

const VILLES = [
  'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Monastir', 'Bizerte', 'Gabès',
  'Ariana', 'Gafsa', 'La Marsa', 'Hammamet', 'Nabeul', 'Mahdia',
  'Kasserine', 'Béja', 'Jendouba', 'Le Kef', 'Siliana'
];

const RUES = [
  'Rue de la Liberté', 'Avenue Habib Bourguiba', 'Rue Mohamed V',
  'Avenue Hedi Chaker', 'Rue Emile Zola', 'Place de la République',
  'Rue du 9 Avril', 'Avenue Farhat Hached', 'Rue Taieb Slimane',
  'Boulevard de l\'Environnement', 'Rue Ibn Khaldoun', 'Avenue de la République',
  'Rue des Entrepreneurs', 'Rue des Oranges', 'Avenue de la Bourse'
];

const NOMS = [
  'Ben Ali', 'Trabelsi', 'Khalil', 'Mabrouk', 'Chaouch', 'Ben Ammar',
  'Bouguerra', 'Ben Slimane', 'Karray', 'Boukadida', 'Ben Hassen',
  'Dakhlaoui', 'Zoghbi', 'Cherif', 'Saïd', 'Bouzaiene', 'Ghouma',
  'Riahi', 'Ben Khelil', 'Charfeddine', 'Hamdi', 'Jouini', 'Bouazizi',
  'Mejri', 'Lahmar', 'Gharbi', 'Oueslati', 'Dridi', 'Haddar', 'Mnif'
];

const PRENOMS = [
  'Mohamed', 'Sarra', 'Mehdi', 'Nour', 'Ahmed', 'Fatma', 'Ali',
  'Amira', 'Youssef', 'Ines', 'Hichem', 'Rania', 'Omar', 'Mona',
  'Karim', 'Leila', 'Anis', 'Samira', 'Tarek', 'Nadia', 'Wassim',
  'Salma', 'Riadh', 'Imen', 'Bassem', 'Asma', 'Hedi', 'Khaled',
  'Yosra', 'Moez', 'Sana', 'Lotfi'
];

const RAISONS_SOCIALES = [
  'Solutions Tech Tunisie', 'Groupe Atlantique', 'Société Nord-Sud',
  'Tunisie Construction BTP', 'Afriqua Services Généraux', 'Méditerranée Invest',
  'Union Commerciale du Centre', 'Expertise Finance & Audit', 'Innovation Plus SARL',
  'Delta Corporation SA', 'Oméga Entreprises', 'Alpha Group Holding',
  'Carthage Industries', 'Sahara Trading Company', 'Phénix Télécom',
  'Tunisie Logistique', 'Maghreb Automobile', 'Cap Bon Agriculture',
  'Hannibal Shipping', 'Utique Matériaux'
];

const PROFESSIONS = [
  'directeur commercial', 'ingénieur en génie civil', 'enseignant', 'expert-comptable',
  'médecin cardiologue', 'pharmacien', 'architecte DPLG', 'commerçant détaillant',
  'technicien supérieur', 'fonctionnaire d\'état', 'consultant en management',
  'chef de projet IT', 'artisan confiseur', 'notaire', 'agent immobilier'
];

const JURIDICTIONS = [
  'Tribunal de Première Instance de Tunis',
  'Tribunal de Première Instance de Sousse',
  'Tribunal de Première Instance de Sfax',
  'Tribunal de Grande Instance de Tunis',
  'Cour d\'Appel de Tunis',
  'Tribunal de Commerce de Tunis',
  'Conseil de Prud\'hommes de Tunis',
  'Tribunal Administratif de Tunis',
  'Cour de Cassation - Chambre Civile',
  'Tribunal Immobilier de Tunis',
  'Juge aux Affaires Familiales de Tunis'
];

const ADVERSAIRES = [
  { nom: 'Pierre Durand', avocat: 'Maître Sophie Laurent' },
  { nom: 'Jean Martin', avocat: 'Maître Jean Dupont' },
  { nom: 'Michel Bernard', avocat: 'Maître Marie Lambert' },
  { nom: 'Alain Dubois', avocat: 'Maître Paul Martin' },
  { nom: 'Patrick Petit', avocat: 'Maître Claire Fontaine' },
  { nom: 'Jacques Robert', avocat: 'Maître Philippe Leroy' },
  { nom: 'Société Concorde SA', avocat: 'Maître Vincent Moreau' },
  { nom: 'Établissements du Sud SARL', avocat: 'Maître Isabelle Garnier' },
  { nom: 'Héritiers Ben Youssef', avocat: 'Maître Karim Jebali' },
  { nom: 'SARL Atlas Distribution', avocat: 'Maître Nadia Kacem' },
  { nom: 'Samir Gharbi et épouse', avocat: 'Maître Hédi Bouazizi' },
  { nom: 'Entreprise Méditerranée SA', avocat: 'Maître Fathi Maalej' }
];

const TYPES_AFFAIRE = ['civil', 'penal', 'commercial', 'travail', 'famille', 'immobilier', 'bancaire', 'administratif'];
const STATUTS = ['nouveau', 'en_cours', 'en_attente', 'cloture', 'archive'];

const genererTel = () => {
  const p = faker.helpers.arrayElement(['+216 2', '+216 5', '+216 9']);
  return `${p}${faker.string.numeric(8)}`;
};

const datePassee = (min, max) =>
  faker.date.between({ from: new Date(Date.now() - max * 86400000), to: new Date(Date.now() - min * 86400000) });

const dateFuture = (min, max) =>
  faker.date.between({ from: new Date(Date.now() + min * 86400000), to: new Date(Date.now() + max * 86400000) });

// ─── DOSSIERS RICHES ET RÉALISTES ──────────────────────────────────
const DOSSIERS_PAR_TYPE = {
  civil: [
    {
      titre: 'Contentieux de divorce et garde d\'enfants',
      description: 'Demande en divorce pour faute intentée par l\'épouse pour abandon du domicile conjugal depuis 14 mois et comportement injurieux. Le couple est marié depuis 12 ans et a deux enfants (8 et 14 ans). Litige sur la garde, la pension alimentaire (mère demande 1200 DT/mois), et le partage du patrimoine commun (villa à La Marsa estimée à 450000 DT, deux véhicules, comptes joints de 80000 DT). Expertise psychologique des enfants ordonnée. Tentative de conciliation échouée.',
      sousType: 'divorce contentieux'
    },
    {
      titre: 'Action en responsabilité civile pour accident de la circulation',
      description: 'Accident de la route survenu le 15 mars 2025 à l\'intersection de l\'Avenue Habib Bourguiba et la Rue de Carthage. Le conducteur adverse a grillé un feu rouge et percuté le véhicule de notre client. Bilan : fracture du fémur, traumatisme crânien léger, ITT de 90 jours. Préjudice corporel estimé à 65000 DT (frais médicaux 12000 DT, perte de revenus 18000 DT, pretium doloris 15000 DT, préjudice esthétique 5000 DT, préjudice d\'agrément 15000 DT). Assurance adverse : AMI Assurances.',
      sousType: 'accident corporel'
    },
    {
      titre: 'Litige de bail commercial - résiliation abusive',
      description: 'Contestation de la résiliation d\'un bail commercial portant sur un local de 120 m² au centre-ville de Tunis. Le propriétaire a notifié la résiliation pour défaut de paiement des loyers de trois mois (total 9000 DT). Le locataire conteste et invoque un trouble de jouissance grave (infiltrations non réparées depuis 8 mois, compteur électrique défectueux) justifiant la suspension des paiements. Demande reconventionnelle en dommages et intérêts de 25000 DT.',
      sousType: 'bail commercial'
    },
    {
      titre: 'Indemnisation pour vice caché - véhicule d\'occasion',
      description: 'Acquisition d\'un véhicule BMW Série 3 année 2022 auprès d\'un concessionnaire professionnel pour 88000 DT. Après 3000 km, apparition de bruits anormaux au niveau du moteur et voyant moteur allumé. Diagnostic du garagiste : défaut de fabrication du vilebrequin nécessitant un remplacement complet du moteur (devis 18500 DT). Action en garantie des vices cachés intentée contre le vendeur professionnel. Résolution de la vente et restitution du prix demandées.',
      sousType: 'vice caché'
    }
  ],
  penal: [
    {
      titre: 'Escroquerie et abus de confiance - détournement de fonds',
      description: 'Plainte pénale pour escroquerie et abus de confiance. Le prévenu, gérant de SARL, a détourné la somme de 280000 DT appartenant à des investisseurs dans le cadre d\'un projet immobilier fictif à Sousse. Fausse promesse de vente, faux documents comptables et disparition des fonds. Constitution de partie civile et demande de séquestre des biens du prévenu (villa à Sousse, comptes bancaires). Enquête préliminaire ouverte et commission rogatoire délivrée.',
      sousType: 'escroquerie'
    },
    {
      titre: 'Vol avec effraction dans un local commercial',
      description: 'Cambriolage d\'un magasin d\'électroménager à Sfax dans la nuit du 8 au 9 juin 2025. Les auteurs ont pénétré par effraction en forçant la porte arrière et ont dérobé du matériel pour une valeur totale de 45000 DT (téléviseurs, climatiseurs, matériel informatique). Les caméras de surveillance ont identifié deux suspects, dont un ancien employé. Flagrant délit pour un tiers des biens retrouvés lors d\'une perquisition. Récidive légale pour l\'un des prévenus.',
      sousType: 'vol'
    },
    {
      titre: 'Trafic de stupéfiants - possession et revente',
      description: 'Interpellation par les douanes au port de Radès : saisie de 2,5 kg de cocaïne dissimulée dans un double-fond d\'une voiture immatriculée en France. Le conducteur, un ressortissant tunisien de 32 ans, affirme avoir été piégé par un réseau international. Garde à vue prolongée, mandat de dépôt. Analyse toxicologique en cours. Le parquet requiert 10 ans de prison ferme. Expertise en écriture et analyse téléphonique sollicitées.',
      sousType: 'trafic stupéfiants'
    },
    {
      titre: 'Diffamation publique sur réseau social',
      description: 'Publication de propos gravement diffamatoires sur Facebook visant un chef d\'entreprise tunisien. Messages accusant la victime de corruption, fraude fiscale et malversations (2000 abonnés, 150 partages). Plainte avec constitution de partie civile. Demande de suppression des publications, droit de réponse, et dommages et intérêts de 50000 DT. Identification de l\'auteur via l\'adresse IP.',
      sousType: 'diffamation'
    }
  ],
  commercial: [
    {
      titre: 'Conflit entre associés et abus de majorité',
      description: 'Litige opposant les associés minoritaires (35%) aux associés majoritaires (65%) d\'une SARL de promotion immobilière. Les minoritaires dénoncent des décisions abusives : distribution de dividendes exceptionnels vidant la trésorerie, rémunération excessive du gérant (24000 DT/mois), et conclusion de contrats de location avec des sociétés appartenant au gérant sans approbation de l\'assemblée. Demande de nomination d\'un administrateur judiciaire et d\'une expertise de gestion.',
      sousType: 'abus de majorité'
    },
    {
      titre: 'Recouvrement de créance - fournitures impayées',
      description: 'Factures impayées d\'un montant total de 185000 DT correspondant à des fournitures de matériaux de construction livrées entre janvier et octobre 2024. Mises en demeure des 15 mars, 30 avril et 15 juin 2025 restées sans effet. Procédure d\'injonction de payer engagée devant le Tribunal de Commerce de Tunis. Saisie conservatoire des comptes bancaires et des créances du débiteur. Demande de dommages pour résistance abusive.',
      sousType: 'recouvrement créance'
    },
    {
      titre: 'Rupture abusive de contrat de distribution exclusive',
      description: 'Contrat de distribution exclusive conclu pour 5 ans le 1er janvier 2022 pour la distribution de produits cosmétiques sur tout le territoire tunisien. Résiliation unilatérale par le fournisseur le 30 juin 2025 sans préavis contractuel de 6 mois. Motif invoqué : baisse des ventes non conforme aux objectifs. Le distributeur conteste et demande réparation du préjudice : perte de marge sur 3 ans (480000 DT), investissements non amortis (75000 DT), licenciement du personnel embauché pour ce contrat.',
      sousType: 'rupture abusive'
    }
  ],
  travail: [
    {
      titre: 'Licenciement pour faute grave - contestation',
      description: 'Licenciement pour faute grave notifié le 10 mai 2025 à un salarié cadre comptable de 48 ans, 18 ans d\'ancienneté dans une société d\'assurance. Motifs invoqués : absences non justifiées (12 jours sur 3 mois) et utilisation abusive de la carte de carburant de la société. Le salarié conteste : les absences étaient liées à des problèmes de santé (certificats médicaux fournis), l\'utilisation de la carte était autorisée pour ses déplacements professionnels. Demande de réintégration et rappel de salaires (156000 DT).',
      sousType: 'licenciement contesté'
    },
    {
      titre: 'Harcèlement moral institutionnel',
      description: 'Plainte pour harcèlement moral déposée par une employée de 38 ans, responsable marketing dans une agence de communication, contre son directeur général. Faits : critiques humiliantes en réunion d\'équipe, mise à l\'écard systématique, retrait progressif de ses responsabilités, surveillance excessive des emails et des horaires. Arrêt maladie pour syndrome anxio-dépressif réactionnel (6 mois). Certificat du médecin du travail préconisant un changement de poste. Demande de dommages : 80000 DT.',
      sousType: 'harcèlement moral'
    },
    {
      titre: 'Licenciement économique sans plan social',
      description: 'Licenciement économique collectif de 45 salariés par une entreprise industrielle de transformation agroalimentaire. Contestation de l\'absence de Plan de Sauvegarde de l\'Emploi (PSE) conforme et du caractère réel et sérieux des difficultés économiques alléguées. Le comité d\'entreprise saisit le Tribunal de Première Instance. Demande de suspension des licenciements et de nomination d\'un expert judiciaire pour analyser les comptes de la société.',
      sousType: 'licenciement économique'
    }
  ],
  famille: [
    {
      titre: 'Divorce par consentement mutuel avec convention',
      description: 'Demande conjointe en divorce par consentement mutuel. Mariés depuis 15 ans, deux enfants de 10 et 13 ans. Convention complète homologuée par le JAF : garde alternée (une semaine chez chacun), pension alimentaire de 900 DT par mois et par enfant, partage égal du patrimoine commun (appartement à Tunis 350000 DT, résidence secondaire à Hammamet 180000 DT, épargne 120000 DT). Honoraires d\'avocat partagés par moitié.',
      sousType: 'consentement mutuel'
    },
    {
      titre: 'Action en reconnaissance de paternité',
      description: 'Action en recherche de paternité intentée par la mère au nom de son enfant mineur de 4 ans. Le père présumé conteste sa paternité et refuse tout contact depuis la naissance. Expertise ADN ordonnée par le juge. En attendant les résultats, demande de pension alimentaire provisoire de 400 DT/mois. La mère justifie de ses démarches par la production d\'échanges de SMS et photos.',
      sousType: 'filiation'
    },
    {
      titre: 'Succession conflictuelle - partage judiciaire',
      description: 'Ouverture de la succession de feu Monsieur Hédi Khelil, décédé le 12 janvier 2025. Trois enfants du premier lit et deux enfants du second lit en conflit sur la validité du testament olographe daté de 2020 qui avantage les enfants du second lit. Masse successorale : 3 immeubles à Tunis (estimés à 1,2 MDT), un portefeuille d\'actions (450000 DT), des comptes bancaires (280000 DT). Procédure de partage judiciaire. Expertise des biens et requête en nullité du testament.',
      sousType: 'succession'
    }
  ],
  immobilier: [
    {
      titre: 'Expulsion résidentielle - impayés de loyers',
      description: 'Procédure d\'expulsion d\'un locataire ayant accumulé 14 mois d\'impayés de loyers (total 16800 DT) dans un appartement situé à Lafayette, Tunis. Commandement de payer délivré le 5 février 2025 par huissier de justice. Le locataire invoque la perte de son emploi et demande des délais de paiement sur 24 mois. Tentative de conciliation échouée. Requête en référé aux fins d\'expulsion.',
      sousType: 'expulsion'
    },
    {
      titre: 'Troubles anormaux de voisinage - nuisance commerciale',
      description: 'Plainte de copropriétaires d\'un immeuble d\'habitation contre une brasserie installée au rez-de-chaussée. Nuisances sonores jusqu\'à 2h du matin en dépit de l\'isolation acoustique insuffisante, odeurs de cuisine, occupation de la voie publique par les terrasses. Non-respect du règlement de copropriété et du bail commercial. Action en cessation du trouble et dommages pour préjudice de jouissance. Mesure d\'expertise acoustique ordonnée.',
      sousType: 'trouble voisinage'
    },
    {
      titre: 'Vente immobilière - demande d\'annulation pour vice caché',
      description: 'Contestation d\'une vente d\'appartement à Sidi Bou Saïd conclue le 15 mars 2025 au prix de 420000 DT. L\'acquéreur découvre après la vente des infiltrations majeures en provenance de la toiture-terrasse non mentionnées dans l\'acte de vente, des fissures structurelles au plafond et un défaut d\'étanchéité de la cave. Devis de réparation : 65000 DT. Action en garantie des vices cachés intentée contre le vendeur. Expertise judiciaire contradictoire diligentée.',
      sousType: 'vice caché immobilier'
    }
  ],
  bancaire: [
    {
      titre: 'Frais bancaires abusifs sur compte professionnel',
      description: 'Contestation de frais bancaires prélevés sur le compte professionnel d\'une PME sur une période de 3 ans (2022-2025). Fraits litigieux : frais de tenue de compte excessifs (45 DT/mois), commissions d\'intervention (12400 DT), frais de rejet de prélèvement (18 DT/opération), cotisation annuelle de carte bancaire obligatoire (250 DT). Total contesté : 38500 DT. Demande de remboursement intégral et dommages pour pratique abusive. Comparaison avec les tarifs moyens du marché.',
      sousType: 'frais abusifs'
    },
    {
      titre: 'Contestation de taux effectif global - crédit immobilier',
      description: 'Contestation du TEG mentionné dans une offre de prêt immobilier de 480000 DT sur 20 ans souscrit en juin 2023. Le TEG annoncé de 9,2% serait usuraire selon les plafonds en vigueur à la date d\'émission (TEG maximum autorisé : 8,75%). En outre, l\'assurance emprunteur obligatoire (0,48% du capital) n\'a pas été intégrée dans le calcul du TEG. Demande de substitution du taux conventionnel par le taux légal et restitution des intérêts indus (estimés à 35000 DT).',
      sousType: 'taux usuraire'
    },
    {
      titre: 'Blocage abusif de compte courant professionnel',
      description: 'Blocage unilatéral et sans préavis d\'un compte bancaire professionnel d\'une SARL d\'import-export le 20 mars 2025. Motif invoqué : déclaration de soupçon au titre de la lutte anti-blanchiment. Montant bloqué : 245000 DT. Le client conteste formellement et produit l\'intégralité de sa comptabilité et de ses contrats commerciaux prouvant la licéité des fonds. Demande de déblocage immédiat sous astreinte de 500 DT/jour et dommages pour préjudice commercial (perte de marchés, image de marque).',
      sousType: 'blocage abusif'
    }
  ],
  administratif: [
    {
      titre: 'Recours pour excès de pouvoir - permis de construire',
      description: 'Recours devant le Tribunal Administratif contre le refus implicite de permis de construire opposé par la municipalité d\'Hammamet sur un projet de résidence touristique de 12 appartements et piscine. Dossier complet déposé le 15 novembre 2024. Silence de l\'administration depuis 6 mois malgré multiples relances. Contestation du motif esthétique invoqué pour le refus exprès subséquent. Violation des règles d\'urbanisme invoquée de manière disproportionnée.',
      sousType: 'permis de construire'
    },
    {
      titre: 'Contentieux fiscal - redressement TVA',
      description: 'Contestation d\'un avis de redressement fiscal notifié le 10 avril 2025 portant sur 95000 DT de rappel de TVA et pénalités pour la période 2022-2024. L\'administration fiscale conteste la déductibilité de certaines factures de sous-traitance et remet en cause le régime de franchise en base. Le contribuable produit l\'intégralité de sa comptabilité, les contrats de sous-traitance et les relevés bancaires. Saisine de la Commission de Recours Fiscale. Demande de sursis de paiement.',
      sousType: 'redressement fiscal'
    }
  ]
};

// ─── GÉNÉRATION DE PDF EXPLICATIF ──────────────────────────────────
const genererPDFNotice = (dossier, client, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 40, left: 50, right: 50 }
      });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const centerX = doc.page.margins.left + pageWidth / 2;

      // ── En-tête ──
      doc.fontSize(10).fillColor('#1e40af').font('Helvetica-Bold');
      doc.text('CABINET BOUSSAYENE KNANI', { align: 'center' });
      doc.fontSize(8).fillColor('#64748b').font('Helvetica');
      doc.text('Avenue Habib Bourguiba - Tunis | Tél: +216 71 123 456', { align: 'center' });
      doc.moveDown(0.3);
      doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + pageWidth, doc.y)
        .strokeColor('#e2e8f0').stroke();
      doc.moveDown(0.8);

      // ── Titre ──
      doc.fontSize(18).fillColor('#1e293b').font('Helvetica-Bold');
      doc.text('NOTE EXPLICATIVE DE DOSSIER', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor('#3b82f6').font('Helvetica-Bold');
      doc.text(dossier.numero, { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(doc.page.margins.left + 50, doc.y).lineTo(doc.page.margins.left + pageWidth - 50, doc.y)
        .strokeColor('#bfdbfe').stroke();
      doc.moveDown(0.8);

      // ── Références ──
      const refX = doc.page.margins.left + 15;
      let contentY = doc.y;

      doc.fontSize(9).fillColor('#475569').font('Helvetica-Bold');
      doc.text('RÉFÉRENCES DU DOSSIER', refX, contentY, { underline: true });
      doc.moveDown(0.5);

      const refs = [
        ['Intitulé', dossier.titre],
        ['Type d\'affaire', typeLabel(dossier.typeAffaire) + (dossier.sousType ? ` (${dossier.sousType})` : '')],
        ['Client', `${client.prenom ? client.prenom + ' ' : ''}${client.nom}`],
        ['Statut', statusLabel(dossier.statut)],
        ['Juridiction', dossier.juridiction || 'Non spécifiée'],
        ['Numéro RG', dossier.numeroRG || 'Non attribué'],
        ['Date création', formatDate(dossier.dateCreation)],
        ['Priorité', `${dossier.priorite}/5`],
        ['Charges estimées', `${dossier.chargeEstimee} heures`]
      ];
      refs.forEach(([label, value]) => {
        doc.fontSize(8.5).fillColor('#64748b').font('Helvetica-Bold').text(`  ${label} : `, { continued: true });
        doc.fillColor('#1e293b').font('Helvetica').text(value || '—');
      });
      doc.moveDown(1);

      // ── Partie adverse ──
      if (dossier.adversary && dossier.adversary.nom) {
        doc.fontSize(9).fillColor('#475569').font('Helvetica-Bold');
        doc.text('PARTIE ADVERSE', refX, doc.y, { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(8.5).fillColor('#64748b').font('Helvetica-Bold').text('  Adverse : ', { continued: true });
        doc.fillColor('#1e293b').font('Helvetica').text(dossier.adversary.nom);
        doc.fontSize(8.5).fillColor('#64748b').font('Helvetica-Bold').text('  Avocat : ', { continued: true });
        doc.fillColor('#1e293b').font('Helvetica').text(dossier.adversary.avocat || '—');
        doc.moveDown(1);
      }

      // ── Description ──
      doc.fontSize(9).fillColor('#475569').font('Helvetica-Bold');
      doc.text('DESCRIPTION DE L\'AFFAIRE', refX, doc.y, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(8.5).fillColor('#334155').font('Helvetica');
      // Split long description into paragraphs
      const para = dossier.description.split(/\.\s+/);
      para.forEach(p => {
        if (p.trim()) doc.text(`  ${p.trim()}.`, { align: 'justify' });
      });
      doc.moveDown(1);

      // ── Échéances ──
      if (dossier.dateAudience) {
        doc.fontSize(9).fillColor('#475569').font('Helvetica-Bold');
        doc.text('PROCHAINE ÉCHÉANCE', refX, doc.y, { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#dc2626').font('Helvetica-Bold');
        doc.text(`  Audience : ${formatDate(dossier.dateAudience)}`, { align: 'left' });
        doc.moveDown(1);
      }

      // ── Analyse juridique ──
      doc.fontSize(9).fillColor('#475569').font('Helvetica-Bold');
      doc.text('ANALYSE JURIDIQUE', refX, doc.y, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(8.5).fillColor('#334155').font('Helvetica');
      doc.text(`  Ce dossier relève du droit ${dossier.typeAffaire} et présente des enjeux ${dossier.priorite >= 4 ? 'majeurs' : 'significatifs'}. ` +
        `La stratégie contentieuse vise à ${dossier.statut === 'cloture' ? 'a abouti à' : 'aboutir à'} une résolution favorable ` +
        `dans les meilleurs délais. ${dossier.chargeEstimee > 100 ? 'La complexité de l\'affaire nécessite une mobilisation importante des ressources du cabinet.' : 'Le dossier est suivi selon la procédure standard.'}`, { align: 'justify' });
      doc.moveDown(1);

      // ── Signature ──
      doc.moveDown(0.5);
      doc.moveTo(doc.page.margins.left + pageWidth - 120, doc.y).lineTo(doc.page.margins.left + pageWidth - 20, doc.y)
        .strokeColor('#cbd5e1').stroke();
      doc.moveDown(0.3);
      doc.fontSize(8).fillColor('#94a3b8').font('Helvetica');
      doc.text(`Document généré le ${new Date().toLocaleDateString('fr-TN')} - Confidentiel Avocat-Client`, pageWidth - 190, doc.y, { width: 180, align: 'right' });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

const typeLabel = (t) => {
  const m = { civil: 'Civil', penal: 'Pénal', commercial: 'Commercial', travail: 'Travail', famille: 'Famille', immobilier: 'Immobilier', bancaire: 'Bancaire', administratif: 'Administratif' };
  return m[t] || t;
};

const statusLabel = (s) => {
  const m = { nouveau: 'Nouveau', en_cours: 'En cours', en_attente: 'En attente', cloture: 'Clôturé', archive: 'Archivé' };
  return m[s] || s;
};

const formatDate = (d) => {
  if (!d) return '—';
  return d.toLocaleDateString('fr-TN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const genererPDFDocument = (nom, dossier, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 40, left: 50, right: 50 } });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      doc.fontSize(10).fillColor('#1e40af').font('Helvetica-Bold');
      doc.text('CABINET BOUSSAYENE KNANI', { align: 'center' });
      doc.moveDown(0.3);
      doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + doc.page.width - doc.page.margins.left - doc.page.margins.right, doc.y)
        .strokeColor('#e2e8f0').stroke();
      doc.moveDown(0.8);

      doc.fontSize(16).fillColor('#1e293b').font('Helvetica-Bold');
      doc.text(nom, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#3b82f6');
      doc.text(`Dossier : ${dossier.numero} - ${dossier.titre}`, { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(9).fillColor('#475569').font('Helvetica');
      doc.text(`Document généré le ${new Date().toLocaleDateString('fr-TN')} pour le dossier ${dossier.numero}.`, { align: 'justify' });
      doc.moveDown(0.5);

      doc.fontSize(9).fillColor('#475569').font('Helvetica-Bold');
      doc.text('Description', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(8.5).fillColor('#334155').font('Helvetica');
      const desc = dossier.description || 'Aucune description disponible.';
      const paras = desc.split(/\.\s+/);
      paras.forEach(p => { if (p.trim()) doc.text(`  ${p.trim()}.`, { align: 'justify' }); });

      doc.moveDown(2);
      doc.moveTo(doc.page.margins.left + doc.page.width - doc.page.margins.left - doc.page.margins.right - 120, doc.y)
        .lineTo(doc.page.margins.left + doc.page.width - doc.page.margins.left - doc.page.margins.right - 20, doc.y)
        .strokeColor('#cbd5e1').stroke();
      doc.moveDown(0.3);
      doc.fontSize(7).fillColor('#94a3b8');
      doc.text('Document généré automatiquement - Confidentiel Avocat-Client', { align: 'right' });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

// ─── MAIN ──────────────────────────────────────────────────────────
(async () => {
  try {
    await connectDB();
    console.log('\n=== SEED AMÉLIORÉ - DOSSIERS RICHES + PDF ===\n');

    const users = await User.find();
    const admin = users.find(u => u.role === 'admin');
    const avocat = users.find(u => u.role === 'avocat') || admin;
    const collaborateur = users.find(u => u.role === 'collaborateur') || users.find(u => u.role !== 'admin' && u.role !== 'avocat');
    const assistant = users.find(u => u.role === 'assistant');
    if (!users.length) throw new Error('Aucun utilisateur trouvé. Lancez d\'abord la seed de base ou create-admin.js.');

    // Clean
    await Promise.all([
      Client.deleteMany({}),
      Dossier.deleteMany({}),
      Tache.deleteMany({}),
      Facture.deleteMany({}),
      Document.deleteMany({}),
      Calendrier.deleteMany({}),
      Parametrage.deleteMany({})
    ]);
    console.log('✓ Collections vidées');

    // ─── 1. CLIENTS ──────────────────────────────────────────────
    const clientsData = [];
    for (let i = 0; i < 14; i++) {
      const nom = faker.helpers.arrayElement(NOMS);
      const prenom = faker.helpers.arrayElement(PRENOMS);
      clientsData.push({
        nom, prenom,
        email: faker.internet.email({ firstName: prenom, lastName: nom }).toLowerCase(),
        telephone: genererTel(),
        adresse: `${faker.number.int({ min: 1, max: 150 })} ${faker.helpers.arrayElement(RUES)}`,
        ville: faker.helpers.arrayElement(VILLES),
        codePostal: faker.string.numeric(4),
        pays: 'Tunisie',
        cin: faker.string.numeric(8),
        type: 'particulier',
        profession: faker.helpers.arrayElement(PROFESSIONS)
      });
    }
    for (let i = 0; i < 6; i++) {
      const r = faker.helpers.arrayElement(RAISONS_SOCIALES);
      clientsData.push({
        nom: r,
        raisonSociale: r,
        email: `contact@${r.toLowerCase().replace(/[^a-z]/g, '')}.tn`,
        telephone: genererTel(),
        adresse: `${faker.number.int({ min: 1, max: 150 })} ${faker.helpers.arrayElement(RUES)}`,
        ville: faker.helpers.arrayElement(VILLES),
        codePostal: faker.string.numeric(4),
        pays: 'Tunisie',
        matriculeFiscal: `${faker.string.alpha(2).toUpperCase()}${faker.string.numeric(6)}`,
        type: 'entreprise'
      });
    }
    const clients = await Client.insertMany(clientsData);
    console.log(`✓ ${clients.length} clients créés`);

    // ─── 2. DOSSIERS ─────────────────────────────────────────────
    const dossiersSpec = [];
    for (const type of TYPES_AFFAIRE) {
      const list = DOSSIERS_PAR_TYPE[type] || [];
      list.forEach(d => dossiersSpec.push({ ...d, typeAffaire: type }));
    }

    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const dossiersCrees = [];
    let nd = 1;
    for (const d of dossiersSpec) {
      const client = faker.helpers.arrayElement(clients);
      const statut = faker.helpers.arrayElement(STATUTS);
      const dateC = datePassee(30, 730);
      const isClosed = statut === 'cloture' || statut === 'archive';
      const adv = faker.helpers.arrayElement(ADVERSAIRES);
      const num = `DOS-${new Date().getFullYear()}-${String(nd).padStart(5, '0')}`;

      const dossierObj = {
        numero: num,
        titre: d.titre,
        description: d.description,
        clientId: client._id,
        typeAffaire: d.typeAffaire,
        sousType: d.sousType || d.typeAffaire.toUpperCase(),
        statut,
        priorite: faker.number.int({ min: 1, max: 5 }),
        assigneA: faker.helpers.arrayElement([avocat, collaborateur, assistant].filter(Boolean))._id,
        collaboreurs: [avocat?._id, collaborateur?._id, assistant?._id].filter(Boolean),
        chargeEstimee: faker.number.int({ min: 15, max: 250 }),
        chargeConsommee: isClosed ? faker.number.int({ min: 10, max: 200 }) : faker.number.int({ min: 0, max: 50 }),
        dateCreation: dateC,
        dateAudience: statut === 'en_cours' ? dateFuture(15, 180) : null,
        dateCloture: isClosed ? datePassee(1, 60) : null,
        numeroRG: `RG-${faker.string.numeric(4)}/${new Date().getFullYear()}`,
        juridiction: faker.helpers.arrayElement(JURIDICTIONS),
        adversary: { nom: adv.nom, avocat: adv.avocat, email: faker.internet.email().toLowerCase() },
        historique: [{
          action: 'creation',
          userId: avocat._id,
          date: dateC,
          details: `Dossier ${num} créé par ${avocat.prenom} ${avocat.nom}`
        }],
        createdBy: avocat._id
      };
      dossiersCrees.push(dossierObj);
      nd++;
    }
    const dossiers = await Dossier.insertMany(dossiersCrees);
    console.log(`✓ ${dossiers.length} dossiers juridiques créés`);

    // ─── 3. GÉNÉRATION PDF EXPLICATIF PAR DOSSIER ───────────────
    console.log('  Génération des notices PDF explicatives...');
    const pdfDir = path.join(uploadsDir, 'notices');
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    const docsData = [];
    for (const dossier of dossiers) {
      const client = clients.find(c => c._id.toString() === dossier.clientId.toString());
      if (!client) continue;
      const pdfName = `NOTICE_${dossier.numero}_${dossier.typeAffaire.toUpperCase()}.pdf`;
      const pdfPath = path.join(pdfDir, pdfName);

      // Vérifier si le client a des documents avant pour diversifier
      const typeDoc = 'piece_jointe';

      await genererPDFNotice(dossier, client, pdfPath);
      docsData.push({
        nom: pdfName,
        description: `Notice explicative détaillée du dossier ${dossier.numero} - ${dossier.titre}`,
        type: typeDoc,
        mimeType: 'application/pdf',
        chemin: `uploads/notices/${pdfName}`,
        taille: fs.statSync(pdfPath).size,
        dossierId: dossier._id,
        clientId: dossier.clientId,
        uploadedBy: avocat._id,
        tags: [dossier.typeAffaire, 'notice', dossier.numero, 'explicatif'],
        version: 1
      });
    }
    await Document.insertMany(docsData);
    console.log(`✓ ${docsData.length} PDF explicatifs générés et indexés`);

    // ─── 4. TÂCHES ───────────────────────────────────────────────
    const TITRES_TACHES = [
      'Préparer la note de plaidoirie', 'Rédiger les conclusions détaillées',
      'Étudier la jurisprudence récente', 'Préparer la convocation des témoins',
      'Réviser le contrat litigieux', 'Déposer la requête au greffe',
      'Entretien téléphonique avec le client', 'Constituer le dossier de pièces',
      'Analyser les conclusions adverses', 'Planifier la réunion de stratégie',
      'Vérifier les délais de procédure', 'Préparer l\'assignation en référé',
      'Rédiger le projet d\'acte de cession', 'Se déplacer chez le client',
      'Demander la communication de pièces', 'Préparer la note d\'audience',
      'Effectuer des recherches doctrinales', 'Rédiger le courrier à l\'adversaire',
      'Préparer la consultation juridique', 'Examiner le dossier en détail',
      'Vérifier la conformité des pièces', 'Préparer le contrat d\'honoraires'
    ];
    const tachesData = [];
    for (let i = 0; i < 35; i++) {
      const dossier = faker.helpers.arrayElement(dossiers);
      const statut = faker.helpers.arrayElement(['a_faire', 'en_cours', 'terminee', 'annulee']);
      const de = dateFuture(-30, 60);
      tachesData.push({
        titre: faker.helpers.arrayElement(TITRES_TACHES),
        description: faker.lorem.sentence({ min: 10, max: 20 }),
        dossierId: dossier._id,
        clientId: dossier.clientId,
        assigneeA: faker.helpers.arrayElement([avocat, collaborateur, assistant].filter(Boolean))._id,
        creePar: avocat._id,
        priorite: faker.number.int({ min: 1, max: 5 }),
        statut,
        dateEcheance: de,
        dateDebut: datePassee(1, 30),
        chargeEstimee: faker.number.int({ min: 2, max: 20 }),
        chargeConsommee: statut === 'terminee' ? faker.number.int({ min: 1, max: 18 }) : 0
      });
    }
    await Tache.insertMany(tachesData);
    console.log(`✓ ${tachesData.length} tâches créées`);

    // ─── 5. FACTURES ─────────────────────────────────────────────
    const facturesData = [];
    const facturables = dossiers.filter(d => d.statut !== 'nouveau');
    let nf = 1;
    for (let i = 0; i < 15; i++) {
      const dossier = faker.helpers.arrayElement(facturables);
      const a1 = { description: 'Honoraires d\'avocat (forfait)', quantite: 1, prixUnitaire: faker.number.int({ min: 800, max: 3000 }), tauxTVA: 19 };
      const a2 = { description: 'Frais de déplacement et débours', quantite: 1, prixUnitaire: faker.number.int({ min: 100, max: 600 }), tauxTVA: 19 };
      const a3 = { description: 'Frais d\'actes et d\'enregistrement', quantite: 1, prixUnitaire: faker.number.int({ min: 50, max: 300 }), tauxTVA: 19 };
      const st = faker.helpers.arrayElement(['brouillon', 'envoyee', 'payee', 'en_retard']);
      const de = datePassee(5, 180);
      facturesData.push({
        numero: `FACT-${new Date().getFullYear()}-${String(nf++).padStart(5, '0')}`,
        type: 'facture',
        clientId: dossier.clientId,
        dossierId: dossier._id,
        dateEmission: de,
        dateEcheance: new Date(de.getTime() + 30 * 86400000),
        dateReglement: st === 'payee' ? new Date(de.getTime() + faker.number.int({ min: 5, max: 25 }) * 86400000) : null,
        statut: st,
        modeReglement: st === 'payee' ? faker.helpers.arrayElement(['virement', 'cheque', 'espece']) : undefined,
        articles: [a1, a2, a3],
        notes: faker.helpers.arrayElement(['Paiement à réception', 'Escompte de 2% sous 15 jours', 'Pénalités de retard : 1%/mois']),
        conditionReglement: '30 jours fin de mois',
        createdBy: avocat._id
      });
    }
    await Facture.insertMany(facturesData);
    console.log(`✓ ${facturesData.length} factures créées`);

    // ─── 6. DOCUMENTS COMPLÉMENTAIRES (un par dossier, typés selon l'affaire) ───────
    const DOCS_PAR_TYPE = {
      civil: ['plainte', 'pouvoir', 'correspondance', 'jugement'],
      penal: ['plainte', 'decision', 'requete', 'correspondance'],
      commercial: ['contrat', 'facture', 'requete', 'jugement'],
      travail: ['contrat', 'correspondance', 'decision', 'plainte'],
      famille: ['requete', 'jugement', 'pouvoir', 'correspondance'],
      immobilier: ['contrat', 'decision', 'plainte', 'jugement'],
      bancaire: ['contrat', 'facture', 'correspondance', 'decision'],
      administratif: ['requete', 'decision', 'correspondance', 'jugement']
    };
    const extraDocs = [];
    for (const dossier of dossiers) {
      const typesDisponibles = DOCS_PAR_TYPE[dossier.typeAffaire] || ['autre'];
      const docsAajouter = [];
      if (dossier.statut === 'cloture' || dossier.statut === 'archive') {
        const typeFinal = typesDisponibles.includes('jugement') ? 'jugement' : 'decision';
        docsAajouter.push(typeFinal);
        const restants = typesDisponibles.filter(t => t !== typeFinal);
        if (restants.length > 0) docsAajouter.push(restants[0]);
      } else {
        const nb = Math.min(2, typesDisponibles.length);
        for (let i = 0; i < nb; i++) docsAajouter.push(typesDisponibles[i]);
      }
      for (const type of docsAajouter) {
        const pdfName = `${type.toUpperCase()}_${dossier.numero}_${faker.string.alphanumeric(4).toUpperCase()}.pdf`;
        const pdfPath = path.join(uploadsDir, pdfName);
        await genererPDFDocument(pdfName, dossier, pdfPath);
        extraDocs.push({
          nom: pdfName,
          description: `${type} relatif au dossier ${dossier.numero}`,
          type,
          mimeType: 'application/pdf',
          chemin: `uploads/${pdfName}`,
          taille: fs.statSync(pdfPath).size,
          dossierId: dossier._id,
          clientId: dossier.clientId,
          uploadedBy: faker.helpers.arrayElement([avocat, collaborateur].filter(Boolean))._id,
          tags: [dossier.typeAffaire, type, dossier.numero],
          version: 1
        });
      }
    }
    await Document.insertMany(extraDocs);
    console.log(`✓ ${extraDocs.length} documents complémentaires créés avec PDF (moy. ${(extraDocs.length / dossiers.length).toFixed(1)}/dossier)`);

    // ─── 7. ÉVÉNEMENTS CALENDRIER ───────────────────────────────
    const eventsData = [];
    const TYPES_EVT = ['audience', 'rendez_vous', 'echeance', 'conge', 'formation'];
    for (let i = 0; i < 15; i++) {
      const type = faker.helpers.arrayElement(TYPES_EVT);
      const dossier = (type === 'audience' || type === 'echeance') ? faker.helpers.arrayElement(dossiers) : null;
      const dd = dateFuture(-15, 120);
      const df = new Date(dd.getTime() + (type === 'audience' ? 2 : 1) * 3600000);
      const titreMap = {
        audience: `Audience ${dossier?.numero || ''}`,
        rendez_vous: 'Rendez-vous consultation client',
        echeance: `Échéance procédure ${dossier?.numero || ''}`,
        conge: 'Congés annuels',
        formation: 'Formation continue droit des affaires'
      };
      eventsData.push({
        titre: titreMap[type],
        description: `${type} planifié`,
        type,
        dossierId: dossier?._id,
        clientId: dossier?.clientId,
        userId: avocat._id,
        assignes: [avocat._id, collaborateur?._id, assistant?._id].filter(Boolean),
        dateDebut: dd,
        dateFin: df,
        estJourEntier: type === 'conge',
        lieu: type === 'audience' ? 'Tribunal de Tunis - Salle 3' : faker.helpers.arrayElement(['Cabinet', 'Tribunal', 'Domicile client']),
        priorite: faker.number.int({ min: 1, max: 5 }),
        statut: faker.helpers.arrayElement(['planifie', 'confirme', 'termine']),
        estPrive: false,
        createdBy: avocat._id
      });
    }
    await Calendrier.insertMany(eventsData);
    console.log(`✓ ${eventsData.length} événements calendrier créés`);

    // ─── 8. PARAMÉTRAGE ──────────────────────────────────────────
    const params = [
      { cle: 'cabinet.nom', valeur: 'Cabinet Boussayene Knani', description: 'Nom du cabinet', categorie: 'general' },
      { cle: 'cabinet.adresse', valeur: 'Avenue Habib Bourguiba, Tunis', description: 'Adresse officielle', categorie: 'general' },
      { cle: 'cabinet.telephone', valeur: '+216 71 123 456', description: 'Téléphone principal', categorie: 'general' },
      { cle: 'facturation.tauxTVA', valeur: 19, description: 'Taux de TVA par défaut (%)', categorie: 'facturation', type: 'number' },
      { cle: 'facturation.devise', valeur: 'DT', description: 'Devise des factures', categorie: 'facturation' },
      { cle: 'facturation.delaiPaiement', valeur: 30, description: 'Délai de paiement (jours)', categorie: 'facturation', type: 'number' },
      { cle: 'dossier.dureeClotureAuto', valeur: 730, description: 'Clôture auto après N jours', categorie: 'dossier', type: 'number' },
      { cle: 'notification.emailActif', valeur: true, description: 'Activer les emails', categorie: 'notification', type: 'boolean' },
      { cle: 'notification.rappelAudience', valeur: 48, description: 'Rappel audience avant (heures)', categorie: 'notification', type: 'number' },
      { cle: 'ia.active', valeur: true, description: 'Activer prédictions IA', categorie: 'ia', type: 'boolean' }
    ];
    await Parametrage.insertMany(params);
    console.log(`✓ ${params.length} paramètres créés`);

    console.log('\n=== SEED TERMINÉ AVEC SUCCÈS ===');
    console.log(`  • ${clients.length} clients`);
    console.log(`  • ${dossiers.length} dossiers juridiques (avec descriptions détaillées)`);
    console.log(`  • ${docsData.length} PDF explicatifs générés`);
    console.log(`  • ${extraDocs.length} documents complémentaires`);
    console.log(`  • ${tachesData.length} tâches`);
    console.log(`  • ${facturesData.length} factures`);
    console.log(`  • ${eventsData.length} événements calendrier`);
    console.log(`  • ${params.length} paramètres\n`);
    console.log(`📁 Notices PDF : ${path.join(uploadsDir, 'notices')}`);
    console.log(`📁 Documents spécifiques : ${uploadsDir}\n`);

    process.exit(0);
  } catch (err) {
    console.error('ERREUR:', err);
    process.exit(1);
  }
})();
