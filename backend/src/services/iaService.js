const categories = [
  { keywords: ['divorce', 'garde', 'pension', 'famille', 'adoption', 'heritage', 'succession'], category: 'famille' },
  { keywords: ['vol', 'meurtre', 'viol', 'agression', 'escroquerie', 'drogue', 'criminalite'], category: 'penal' },
  { keywords: ['bail', 'location', 'vente', 'immeuble', 'copropriete', 'trouble', 'bailleur'], category: 'immobilier' },
  { keywords: ['contrat', 'societe', 'statut', 'shareholder', 'actionnaire', 'assemblee', 'gerant'], category: 'commercial' },
  { keywords: ['licenciement', 'harcelement', 'salaire', 'conge', 'syndicat', 'travailleur'], category: 'travail' },
  { keywords: ['impot', 'taxe', 'recours', 'administration', 'fonctionnaire', 'marche public'], category: 'administratif' },
  { keywords: ['credit', 'pret', 'banque', 'compte', 'frais', 'fonde'], category: 'bancaire' }
];

const predictCategory = async (description) => {
  try {
    const lowerDesc = description.toLowerCase();
    let bestMatch = { category: 'autre', confiance: 0 };

    for (const { keywords, category } of categories) {
      const matches = keywords.filter(kw => lowerDesc.includes(kw));
      const confiance = (matches.length / keywords.length) * 100;
      
      if (confiance > bestMatch.confiance) {
        bestMatch = { category, confiance: Math.min(confiance, 95) };
      }
    }

    return {
      categorieSuggeree: bestMatch.category,
      confiance: Math.round(bestMatch.confiance),
      datePrediction: new Date()
    };
  } catch (error) {
    return { categorieSuggeree: 'autre', confiance: 0, datePrediction: new Date() };
  }
};

module.exports = { predictCategory };