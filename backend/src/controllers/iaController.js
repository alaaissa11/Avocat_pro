const TypeAffaire = require('../models/TypeAffaire');
const { TfIdf } = require('natural/lib/natural/tfidf');
const { words: stopwordsFr } = require('natural/lib/natural/util/stopwords_fr');
const Tokenizer = require('natural/lib/natural/tokenizers/regexp_tokenizer').WordTokenizer;

function buildCorpusText(type) {
  const parts = [type.nom, type.description];
  if (type.sousTypes && type.sousTypes.length > 0) {
    type.sousTypes.forEach(st => {
      parts.push(st.nom);
      if (st.description) parts.push(st.description);
    });
  }
  return parts.filter(Boolean).join(' ');
}

function buildTfIdf(types) {
  const tfidf = new TfIdf();
  tfidf.setTokenizer(new Tokenizer());
  tfidf.setStopwords(stopwordsFr);
  types.forEach(t => tfidf.addDocument(buildCorpusText(t), t._id.toString()));
  return tfidf;
}

exports.suggestType = async (req, res) => {
  try {
    const { texte } = req.body;
    if (!texte || texte.trim().length < 3) {
      return res.status(400).json({ message: 'Texte trop court (min 3 caractères)' });
    }

    const types = await TypeAffaire.find({ actif: true }).lean();
    if (types.length === 0) {
      return res.json({ suggestions: [] });
    }

    const tfidf = buildTfIdf(types);
    const rawScores = tfidf.tfidfs(texte);

    const results = types
      .map((type, i) => ({
        typeAffaire: type.categorie,
        sousTypes: (type.sousTypes || []).map(st => st.nom),
        juridiction: type.juridictionCompetente || '',
        piecesRequises: type.piecesRequises || [],
        score: rawScores[i]
      }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);

    const maxScore = results.length > 0 ? results[0].score : 1;
    results.forEach(s => {
      s.confiance = Math.min(Math.round((s.score / maxScore) * 100), 99);
    });

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error in suggestType:', error);
    res.status(500).json({ message: 'Erreur lors de la suggestion', error: error.message });
  }
};
