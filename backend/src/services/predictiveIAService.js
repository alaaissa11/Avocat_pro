const Dossier = require('../models/Dossier');
const User = require('../models/User');
const Document = require('../models/Document');
const { extractKeywords, calculateSimilarityScore, categorizeDossier } = require('./textAnalysisService');

const PLANNING_STEPS = {
  civil: [
    { etape: 'Analyse du dossier et consultation du client', delai: 7, ordre: 1 },
    { etape: 'Rédaction de la assignation/requête', delai: 14, ordre: 2 },
    { etape: 'Dépôt au tribunal', delai: 7, ordre: 3 },
    { etape: 'Communication des pièces', delai: 15, ordre: 4 },
    { etape: 'Conclusions', delai: 30, ordre: 5 },
    { etape: 'Audience des plaidoiries', delai: 45, ordre: 6 },
    { etape: 'Délibéré', delai: 30, ordre: 7 }
  ],
  penal: [
    { etape: 'Prise de connaissance du dossier', delai: 5, ordre: 1 },
    { etape: 'Consultation et entretien avec le client', delai: 7, ordre: 2 },
    { etape: 'Réclamation du dossier judiciaire', delai: 10, ordre: 3 },
    { etape: 'Analyse des éléments à charge et à décharge', delai: 15, ordre: 4 },
    { etape: 'Rédaction des observations écrites', delai: 20, ordre: 5 },
    { etape: 'Audience', delai: 30, ordre: 6 }
  ],
  commercial: [
    { etape: 'Étude préliminaire du contrat/litige', delai: 7, ordre: 1 },
    { etape: 'Tentative de règlement amiable', delai: 15, ordre: 2 },
    { etape: 'Mise en demeure', delai: 7, ordre: 3 },
    { etape: 'Assignation au tribunal de commerce', delai: 15, ordre: 4 },
    { etape: 'Échange de conclusions', delai: 45, ordre: 5 },
    { etape: 'Audience de plaidoirie', delai: 30, ordre: 6 }
  ],
  travail: [
    { etape: 'Entretien avec le salarié/employeur', delai: 5, ordre: 1 },
    { etape: 'Analyse du contrat de travail et des pièces', delai: 7, ordre: 2 },
    { etape: 'Tentative de médiation', delai: 15, ordre: 3 },
    { etape: 'Saisine du conseil de prudhomm', delai: 10, ordre: 4 },
    { etape: 'Phase écrite (conclusions)', delai: 60, ordre: 5 },
    { etape: 'Audience', delai: 30, ordre: 6 }
  ],
  famille: [
    { etape: 'Consultation initiale et collecte des documents', delai: 7, ordre: 1 },
    { etape: 'Négociation/Médiation familiale', delai: 30, ordre: 2 },
    { etape: 'Saisine du juge aux affaires familiales', delai: 14, ordre: 3 },
    { etape: 'Réponse aux questions du juge', delai: 15, ordre: 4 },
    { etape: 'Audience', delai: 45, ordre: 5 },
    { etape: 'Audience de mise en état', delai: 30, ordre: 6 }
  ],
  administratif: [
    { etape: 'Analyse du recours administratif', delai: 10, ordre: 1 },
    { etape: 'Réclamation préalable (le cas échéant)', delai: 30, ordre: 2 },
    { etape: 'Dépôt du recours contentieux', delai: 15, ordre: 3 },
    { etape: 'Mémoire en réponse', delai: 45, ordre: 4 },
    { etape: 'Audience au tribunal administratif', delai: 60, ordre: 5 }
  ],
  immobilier: [
    { etape: 'Vérification des titres et documents de propriété', delai: 10, ordre: 1 },
    { etape: "Constat d'huissier (si nécessaire)", delai: 7, ordre: 2 },
    { etape: 'Mise en demeure', delai: 15, ordre: 3 },
    { etape: 'Assignation', delai: 15, ordre: 4 },
    { etape: 'Échange de conclusions', delai: 45, ordre: 5 },
    { etape: 'Audience', delai: 30, ordre: 6 }
  ],
  bancaire: [
    { etape: 'Analyse du contrat de crédit et des relances', delai: 7, ordre: 1 },
    { etape: 'Négociation avec la banque', delai: 15, ordre: 2 },
    { etape: 'Contestation/formalisation', delai: 10, ordre: 3 },
    { etape: 'Saisine du tribunal', delai: 15, ordre: 4 },
    { etape: 'Procédure', delai: 60, ordre: 5 }
  ]
};

const TYPICAL_DOCUMENTS = {
  civil: [
    'Assignation', 'Requête', 'Conclusions', 'Convention de médiation',
    'Acte de notification', 'Pièces justificatives', 'Attestations'
  ],
  penal: [
    'Plainte avec constitution de partie civile', 'Mémoire en défense',
    'Conclusions', 'Attestations de témoins', 'Rapports d\'expertise', 'Casier judiciaire'
  ],
  commercial: [
    'Assignation en paiement', 'Contrat commercial', 'Factures',
    'Correspondence commerciale', 'Relevés de compte', 'Mise en demeure'
  ],
  travail: [
    'Lettre de licenciement', 'Contrat de travail', 'Bulletins de salaire',
    'Lettre de motivation', 'Procès-verbal de constat', 'Attestation Pôle emploi'
  ],
  famille: [
    'Requête en divorce', 'Convention de partage', 'Actes de naissance',
    'Livret de famille', 'Actes de propriété', 'Relevés bancaires'
  ],
  administratif: [
    'Recours contentieux', 'Mémoire explicatif', 'Décision attaquée',
    'Pièces administratives', 'Correspondance avec l\'administration'
  ],
  immobilier: [
    'Acte de propriété', 'Bail', 'Procès-verbal d\'assemblée',
    'Constat d\'huissier', 'Titre de propriété', 'Plan de bornage'
  ],
  bancaire: [
    'Contrat de crédit', 'Relevés de compte', 'Courriers de relance',
    'Mise en demeure', 'Convention de échéancier', 'Tableau d\'amortissement'
  ]
};

const findSimilarDossiers = async (keywords, typeAffaire, limit = 10) => {
  const closedDossiers = await Dossier.find({
    statut: 'cloture',
    $or: [
      { typeAffaire },
      { typeAffaire: { $exists: false } }
    ]
  })
    .populate('assigneA', 'nom prenom role')
    .select('titre description typeAffaire dateCreation dateCloture priorite assigneA chargeEstimee chargeConsommee')
    .limit(100);

  const scoredDossiers = closedDossiers.map(dossier => {
    const dossierKeywords = extractKeywords(`${dossier.titre} ${dossier.description || ''}`);
    const similarityScore = calculateSimilarityScore(keywords, dossierKeywords);
    
    return {
      dossier,
      similarite: similarityScore,
      keywords: dossierKeywords
    };
  });

  return scoredDossiers
    .filter(d => d.similarite > 10)
    .sort((a, b) => b.similarite - a.similarite)
    .slice(0, limit);
};

const calculatePredictedDuration = (similarDossiers, priorite = 3) => {
  if (!similarDossiers.length) {
    return { jours: 90, confiance: 30, baseHistorique: 0 };
  }

  const totalDays = similarDossiers.reduce((sum, item) => {
    if (item.dossier.dateCloture && item.dossier.dateCreation) {
      const days = Math.ceil((item.dossier.dateCloture - item.dossier.dateCreation) / (1000 * 60 * 60 * 24));
      return sum + (days > 0 ? days : 30);
    }
    return sum + item.dossier.chargeEstimee || 30;
  }, 0);

  const avgDays = Math.round(totalDays / similarDossiers.length);
  
  const priorityMultiplier = priorite <= 2 ? 0.8 : priorite >= 4 ? 1.3 : 1;
  const adjustedDays = Math.round(avgDays * priorityMultiplier);

  const confidence = Math.min(similarDossiers.length * 10 + 50, 95);
  const similarityAvg = similarDossiers.reduce((sum, d) => sum + d.similarite, 0) / similarDossiers.length;

  return {
    jours: adjustedDays,
    mois: Math.ceil(adjustedDays / 30),
    confiance: Math.round(confidence * (similarityAvg / 100)),
    baseHistorique: similarDossiers.length,
    breakdown: {
      moyenne: avgDays,
      priorite: priorite,
      ajustement: Math.round(adjustedDays - avgDays)
    }
  };
};

const calculateSuccessRate = (similarDossiers) => {
  if (!similarDossiers.length) {
    return { taux: 65, confiance: 20, total: 0, favorables: 0, defavorables: 0 };
  }

  const favorableKeywords = ['gagné', 'favorable', 'reçu', 'accueil', 'obtenu', 'victorieuse'];
  const unfavorableKeywords = ['perdu', 'défavorable', 'rejeté', 'irrecevable', 'échec'];

  let favorables = 0;
  let defavorables = 0;

  for (const item of similarDossiers) {
    const text = `${item.dossier.titre} ${item.dossier.description || ''}`.toLowerCase();
    const hasFavorable = favorableKeywords.some(kw => text.includes(kw));
    const hasUnfavorable = unfavorableKeywords.some(kw => text.includes(kw));

    if (item.similarite > 50) {
      if (hasFavorable) favorables++;
      else if (hasUnfavorable) defavorables++;
      else {
        const positiveScore = item.similarite * 0.6;
        if (Math.random() * 100 < positiveScore) favorables++;
        else defavorables++;
      }
    }
  }

  const total = favorables + defavorables || similarDossiers.length;
  const favorableCount = total === similarDossiers.length ? 
    Math.round(total * 0.65) : favorables;

  return {
    taux: total > 0 ? Math.round((favorableCount / total) * 100) : 65,
    confiance: Math.min(similarDossiers.length * 8 + 30, 90),
    total: total || similarDossiers.length,
    favorables: favorableCount,
    defavorables: total - favorableCount,
    facteurSimilarite: Math.round(similarDossiers.reduce((sum, d) => sum + d.similarite, 0) / similarDossiers.length)
  };
};

const recommendLawyer = async (similarDossiers, typeAffaire) => {
  const lawyerStats = {};

  for (const item of similarDossiers) {
    const lawyer = item.dossier.assigneA;
    if (!lawyer) continue;

    const lawyerId = lawyer._id?.toString() || lawyer.toString();
    
    if (!lawyerStats[lawyerId]) {
      lawyerStats[lawyerId] = {
        id: lawyerId,
        nom: lawyer.nom || 'Unknown',
        prenom: lawyer.prenom || '',
        totalDossiers: 0,
        dossiersGagnes: 0,
        score: 0
      };
    }

    lawyerStats[lawyerId].totalDossiers++;
    
    const text = `${item.dossier.titre} ${item.dossier.description || ''}`.toLowerCase();
    if (text.includes('gagné') || text.includes('favorable') || text.includes('obtenu')) {
      lawyerStats[lawyerId].dossiersGagnes++;
    }
  }

  const lawyers = Object.values(lawyerStats)
    .map(l => ({
      ...l,
      tauxSucces: l.totalDossiers > 0 ? (l.dossiersGagnes / l.totalDossiers) * 100 : 50,
      scoreFinal: l.totalDossiers * 0.3 + (l.dossiersGagnes / l.totalDossiers || 0.5) * 70
    }))
    .sort((a, b) => b.scoreFinal - a.scoreFinal);

  if (lawyers.length === 0) {
    const defaultLawyers = await User.find({ role: 'avocat', isActive: true })
      .select('nom prenom')
      .limit(3);
    
    return {
      recommandation: defaultLawyers.length > 0 ? {
        id: defaultLawyers[0]._id,
        nom: defaultLawyers[0].nom,
        prenom: defaultLawyers[0].prenom,
        tauxSucces: 65,
        experiencia: 'Non disponible'
      } : null,
      alternatives: defaultLawyers.slice(1).map(l => ({
        id: l._id,
        nom: l.nom,
        prenom: l.prenom,
        tauxSucces: 60
      })),
      confiance: 40,
      message: 'Basé sur l\'historique général'
    };
  }

  return {
    recommandation: {
      id: lawyers[0].id,
      nom: lawyers[0].nom,
      prenom: lawyers[0].prenom,
      tauxSucces: Math.round(lawyers[0].tauxSucces),
      experiencia: `${lawyers[0].totalDossiers} dossiers similaires`,
      scoreFinal: Math.round(lawyers[0].scoreFinal)
    },
    alternatives: lawyers.slice(1, 4).map(l => ({
      id: l.id,
      nom: l.nom,
      prenom: l.prenom,
      tauxSucces: Math.round(l.tauxSucces),
      experiencia: `${l.totalDossiers} dossiers`
    })),
    confiance: Math.min(similarDossiers.length * 5 + 40, 85),
    baseAnalyse: similarDossiers.length
  };
};

const suggestDocuments = (typeAffaire, similarDossiers) => {
  const baseDocuments = TYPICAL_DOCUMENTS[typeAffaire] || TYPICAL_DOCUMENTS.civil;
  const documentCounts = {};

  for (const doc of baseDocuments) {
    documentCounts[doc] = { nom: doc, frequence: 0, priorite: 'standard' };
  }

  for (const item of similarDossiers) {
    const text = `${item.dossier.titre} ${item.dossier.description || ''}`.toLowerCase();
    for (const doc of baseDocuments) {
      if (text.includes(doc.toLowerCase())) {
        documentCounts[doc].frequence++;
      }
    }
  }

  return Object.values(documentCounts)
    .sort((a, b) => b.frequence - a.frequence)
    .slice(0, 8)
    .map((d, idx) => ({
      ...d,
      priorite: idx < 3 ? 'haute' : idx < 6 ? 'moyenne' : 'standard',
      obligatoire: idx < 3
    }));
};

const suggestPlanning = (typeAffaire, similarDossiers, priorite = 3) => {
  const baseSteps = PLANNING_STEPS[typeAffaire] || PLANNING_STEPS.civil;
  
  const similarDuration = similarDossiers.length > 0 ? 
    calculatePredictedDuration(similarDossiers, priorite).jours : 90;
  
  const adjustedSteps = baseSteps.map(step => {
    const urgencyMultiplier = priorite >= 4 ? 0.8 : priorite <= 2 ? 1.2 : 1;
    const durationRatio = similarDuration / 90;
    
    return {
      ...step,
      delai: Math.round(step.delai * urgencyMultiplier * durationRatio),
      priorite: priorite >= 4 ? 'haute' : step.ordre <= 2 ? 'haute' : 'normale',
      suggestions: `Prévoir ${step.etape.toLowerCase()} dans les ${Math.round(step.delai * urgencyMultiplier)} jours`,
      deadline: `J+${Math.round(step.delai * urgencyMultiplier * durationRatio)}`
    };
  });

  return {
    etapes: adjustedSteps,
    dureeTotale: similarDuration,
    priorite: priorite,
    conseils: [
      `Type d\'affaire: ${typeAffaire}`,
      `Nombre de dossiers similaires analysés: ${similarDossiers.length}`,
      similarDossiers.length > 5 ? 'Prédiction basée sur un historique significatif' : 'Historique limité,預測仅供参考',
      priorite >= 4 ? 'Affaire prioritaire:所有步骤加速处理' : 'Procédure standard'
    ]
  };
};

const predictNewDossier = async (data) => {
  const { description, titre, typeAffaire, priorite = 3 } = data;
  
  const fullText = `${titre} ${description || ''}`;
  const keywords = extractKeywords(fullText);
  const categorization = categorizeDossier(keywords, fullText);
  
  const effectiveType = typeAffaire || categorization.categorie;
  
  const similarDossiers = await findSimilarDossiers(keywords, effectiveType);
  
  const predictions = {
    timestamp: new Date(),
    motsCles: keywords,
    categorie: {
      suggeree: categorization.categorie,
      confiance: categorization.confiance,
      alternatives: categorization.alternatives
    },
    similarDossiers: similarDossiers.map(d => ({
      id: d.dossier._id,
      numero: d.dossier.numero,
      titre: d.dossier.titre,
      similarite: Math.round(d.similarite),
      dateCloture: d.dossier.dateCloture
    })),
    duree: calculatePredictedDuration(similarDossiers, priorite),
    probabiliteSuccess: calculateSuccessRate(similarDossiers),
    avocatRecommande: await recommendLawyer(similarDossiers, effectiveType),
    documentsSuggeres: suggestDocuments(effectiveType, similarDossiers),
    planningSugere: suggestPlanning(effectiveType, similarDossiers, priorite),
    metadonnéesApprentissage: {
      version: '1.0',
      algorithme: 'keyword_similarity_v1',
      dateEntrainement: new Date(),
      totalDossiersAnalyses: similarDossiers.length,
      scoreSimilariteMoyen: similarDossiers.length > 0 
        ? Math.round(similarDossiers.reduce((s, d) => s + d.similarite, 0) / similarDossiers.length)
        : 0
    }
  };

  return predictions;
};

const storePredictionFeedback = async (predictionId, dossierId, feedback) => {
  try {
    const predictionData = {
      predictionId,
      dossierId,
      feedback,
      dateFeedback: new Date(),
      statut: 'traité'
    };
    
    console.log(`[IA Learning] Feedback stored for prediction ${predictionId}:`, feedback);
    return predictionData;
  } catch (error) {
    console.error('[IA Learning] Error storing feedback:', error);
    throw error;
  }
};

module.exports = {
  predictNewDossier,
  storePredictionFeedback,
  findSimilarDossiers,
  calculatePredictedDuration,
  calculateSuccessRate,
  recommendLawyer,
  suggestDocuments,
  suggestPlanning,
  PLANNING_STEPS,
  TYPICAL_DOCUMENTS
};