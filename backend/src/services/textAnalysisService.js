const stopWords = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'de', 'du', 'au', 'aux',
  'ce', 'cette', 'ces', 'qui', 'que', 'quoi', 'dont', 'où', 'quand', 'comment',
  'pour', 'par', 'sur', 'sous', 'avec', 'sans', 'dans', 'entre', 'chez', 'vers',
  'est', 'sont', 'été', 'être', 'avoir', 'fait', 'faire', 'dit', 'dire',
  'il', 'elle', 'ils', 'elles', 'je', 'tu', 'nous', 'vous', 'mon', 'ma', 'mes',
  'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'votre', 'leur', 'leurs',
  'tout', 'tous', 'toute', 'toutes', 'autre', 'autres', 'même', 'mêmes',
  'ne', 'pas', 'plus', 'moins', 'très', 'bien', 'mal', 'encore', 'déjà',
  'donc', 'alors', 'mais', 'car', 'ni', 'aussi', 'tanôt', 'bientôt'
]);

const keywordWeights = {
  type_affaire: {
    'divorce': 5, 'séparation': 5, 'garde': 5, 'pension': 4, 'famille': 4,
    'vol': 5, 'meurtre': 5, 'agression': 5, 'escroquerie': 5, 'drogue': 4,
    'bail': 5, 'location': 4, 'vente': 4, 'immeuble': 4, 'copropriété': 4,
    'contrat': 4, 'société': 4, 'actionnaire': 5, 'assemblée': 3, 'gérant': 4,
    'licenciement': 5, 'harcèlement': 5, 'salaire': 4, 'congé': 4,
    'impôt': 5, 'taxe': 4, 'recours': 4, 'administration': 3,
    'crédit': 4, 'prêt': 4, 'banque': 4, 'dette': 4
  },
  motif: {
    'contestation': 4, 'demande': 3, 'requête': 4, 'plainte': 5,
    'indemnisation': 5, 'dommages': 4, 'intérêts': 4, 'réparation': 4,
    'annulation': 4, 'résiliation': 4, 'exécution': 4, 'paiement': 3,
    'violation': 4, 'manquement': 4, 'négligence': 4
  },
  demande: {
    'condamnation': 4, 'allocation': 4, 'attribution': 3, 'restitution': 4,
    'interdiction': 4, 'autorisation': 3, 'reconnaissance': 4, 'jugement': 3
  },
  partie: {
    'demandeur': 4, 'défendeur': 4, 'partie': 3, 'victime': 4, 'accusé': 4,
    'prévenu': 4, 'intestin': 3, 'héritier': 4, 'époux': 4, 'employeur': 4,
    'employé': 4, 'locataire': 4, 'bailleur': 4, 'créancier': 4, 'débiteur': 4
  }
};

const extractKeywords = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const words = text.toLowerCase()
    .replace(/[^\w\séèêëàâäùûüôöîïç\-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
  
  const keywords = [];
  const seen = new Set();
  
  for (const word of words) {
    if (stopWords.has(word) || seen.has(word)) continue;
    
    let weight = 1;
    let category = 'general';
    
    for (const [cat, weights] of Object.entries(keywordWeights)) {
      for (const [key, w] of Object.entries(weights)) {
        if (word.includes(key) || key.includes(word)) {
          if (w > weight) {
            weight = w;
            category = cat;
          }
        }
      }
    }
    
    if (weight > 1 || word.length > 4) {
      keywords.push({ word, weight, category });
      seen.add(word);
    }
  }
  
  return keywords.sort((a, b) => b.weight - a.weight).slice(0, 15);
};

const calculateSimilarityScore = (keywords1, keywords2) => {
  if (!keywords1.length || !keywords2.length) return 0;
  
  const map1 = new Map(keywords1.map(k => [k.word, k.weight]));
  const map2 = new Map(keywords2.map(k => [k.word, k.weight]));
  
  let score = 0;
  let maxScore = 0;
  
  for (const [word, weight1] of map1) {
    maxScore += weight1;
    const weight2 = map2.get(word) || 0;
    score += Math.min(weight1, weight2);
  }
  
  for (const [word, weight2] of map2) {
    if (!map1.has(word)) {
      maxScore += weight2;
    }
  }
  
  return maxScore > 0 ? (score / maxScore) * 100 : 0;
};

const categorizeDossier = (keywords, description) => {
  const typeScores = {
    civil: 0, penal: 0, commercial: 0, travail: 0,
    famille: 0, administratif: 0, immobilier: 0, bancaire: 0, autre: 0
  };
  
  const typeKeywords = {
    civil: ['dommages', 'responsabilité', 'obligations', 'contrat', 'réparation'],
    penal: ['vol', 'meurtre', 'agression', 'escroquerie', 'drogue', 'infraction', 'criminalité'],
    commercial: ['société', 'contrat', 'commerce', 'affaires', 'actionnaire', 'gérant'],
    travail: ['licenciement', 'salaire', 'harcèlement', 'congé', 'contrat de travail', 'syndicat'],
    famille: ['divorce', 'garde', 'pension', 'succession', 'héritage', 'famille', 'adoption'],
    administratif: ['administration', 'impôt', 'taxe', 'recours', 'fonctionnaire', 'marché public'],
    immobilier: ['immeuble', 'bail', 'location', 'copropriété', 'vente', 'trouble de jouissance'],
    bancaire: ['crédit', 'prêt', 'banque', 'dette', 'remboursement', 'fonds']
  };
  
  const text = `${description} ${keywords.map(k => k.word).join(' ')}`.toLowerCase();
  
  for (const [type, words] of Object.entries(typeKeywords)) {
    for (const word of words) {
      if (text.includes(word)) {
        typeScores[type] += 2;
      }
    }
  }
  
  for (const kw of keywords) {
    if (typeScores[kw.category] !== undefined) {
      typeScores[kw.category] += kw.weight;
    }
  }
  
  const sorted = Object.entries(typeScores).sort((a, b) => b[1] - a[1]);
  return {
    categorie: sorted[0][0],
    confiance: sorted[0][1] > 0 ? Math.min((sorted[0][1] / 20) * 100, 95) : 30,
    alternatives: sorted.slice(1, 4).filter(([, s]) => s > 0)
  };
};

const extractEntities = (text) => {
  const entities = {
    montants: [],
    dates: [],
    personnes: [],
    lieux: []
  };
  
  const montantPattern = /(\d+[\s,.]?\d{0,3})\s*(euros?|dt|dinars?|tnd)/gi;
  const datePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g;
  
  let match;
  while ((match = montantPattern.exec(text)) !== null) {
    entities.montants.push(match[0]);
  }
  while ((match = datePattern.exec(text)) !== null) {
    entities.dates.push(match[0]);
  }
  
  return entities;
};

module.exports = {
  extractKeywords,
  calculateSimilarityScore,
  categorizeDossier,
  extractEntities,
  stopWords
};