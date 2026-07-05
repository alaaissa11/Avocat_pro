const Client = require('../models/Client');
const Operation = require('../models/Operation');
const Dossier = require('../models/Dossier');

const buildClientScopeForUser = async (user) => {
  console.log('[buildClientScopeForUser] Starting for user:', user.email, 'role:', user.role, '_id:', user._id);
  
  if (user.role === 'admin') {
    console.log('[buildClientScopeForUser] User is admin - no scope');
    return {};
  }

  const userId = user._id;
  const dossierScope = {
    $or: [
      { assigneA: userId },
      { collaboreurs: userId },
      { createdBy: userId }
    ]
  };

  console.log('[buildClientScopeForUser] Searching for dossiers matching:', JSON.stringify(dossierScope));
  
  const userDossiers = await Dossier.find(dossierScope).select('clientId').lean();
  console.log('[buildClientScopeForUser] Found', userDossiers.length, 'dossiers');
  
  const clientIdsFromDossiers = userDossiers
    .filter(d => d.clientId)
    .map(d => d.clientId);

  console.log('[buildClientScopeForUser] Client IDs found:', clientIdsFromDossiers);

  if (clientIdsFromDossiers.length === 0) {
    console.log('[buildClientScopeForUser] No clients - returning { _id: null }');
    return { _id: null };
  }

  const scope = {
    $or: [
      { _id: { $in: clientIdsFromDossiers } },
      { createdBy: userId }
    ]
  };
  
  console.log('[buildClientScopeForUser] Final scope:', JSON.stringify(scope));
  return scope;
};

exports.createClient = async (req, res) => {
  try {
    console.log('[Client] Données reçues:', JSON.stringify(req.body, null, 2));
    const client = new Client({ ...req.body, createdBy: req.user._id });
    await client.save();
    console.log('[Client] Créé avec succès:', client._id);

    await new Operation({
      type: 'client_cree',
      entiteType: 'client',
      entiteId: client._id,
      userId: req.user._id,
      userEmail: req.user.email,
      details: `Client ${client.nom} created`
    }).save();

    res.status(201).json(client);
  } catch (error) {
    console.error('[Client] Erreur création:', error);
    res.status(500).json({ message: 'Error creating client', error: error.message });
  }
};

exports.getClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { telephone: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) query.type = type;

    const scope = await buildClientScopeForUser(req.user);
    
    if (Object.keys(scope).length > 0) {
      if (query.$or) {
        query.$and = [{ $or: query.$or }, scope];
        delete query.$or;
      } else {
        Object.assign(query, scope);
      }
    }

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Client.countDocuments(query);

    res.json({
      clients,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients', error: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const scope = await buildClientScopeForUser(req.user);
    if (Object.keys(scope).length > 0) {
      const scopeQuery = { _id: client._id, ...scope };
      const inScope = await Client.findOne(scopeQuery);
      if (!inScope) {
        return res.status(403).json({ message: 'Accès refusé à ce client.' });
      }
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client', error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const existing = await Client.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const scope = await buildClientScopeForUser(req.user);
    if (Object.keys(scope).length > 0) {
      const scopeQuery = { _id: existing._id, ...scope };
      const inScope = await Client.findOne(scopeQuery);
      if (!inScope) {
        return res.status(403).json({ message: 'Accès refusé à ce client.' });
      }
    }

    const oldClient = existing;
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await new Operation({
      type: 'client_modifie',
      entiteType: 'client',
      entiteId: client._id,
      userId: req.user._id,
      userEmail: req.user.email,
      anciennesValeurs: oldClient.toObject(),
      nouvellesValeurs: client.toObject(),
      details: `Client ${client.nom} updated`
    }).save();

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error updating client', error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const existing = await Client.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (req.user.role !== 'admin') {
      const scope = await buildClientScopeForUser(req.user);
      if (Object.keys(scope).length > 0) {
        const scopeQuery = { _id: existing._id, ...scope };
        const inScope = await Client.findOne(scopeQuery);
        if (!inScope) {
          return res.status(403).json({ message: 'Accès refusé à ce client.' });
        }
      }
    }

    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client', error: error.message });
  }
};