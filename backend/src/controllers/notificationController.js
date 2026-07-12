const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = { receiver: req.user._id };
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    const total = await Notification.countDocuments(query);
    const unread = await Notification.countDocuments({ receiver: req.user._id, lu: false });
    res.json({ notifications, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }, unread });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

exports.markAsLu = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany({ receiver: req.user._id, lu: false }, { lu: true });
    } else {
      await Notification.findOneAndUpdate({ _id: id, receiver: req.user._id }, { lu: true });
    }
    const unread = await Notification.countDocuments({ receiver: req.user._id, lu: false });
    res.json({ message: 'Notifications marquées comme lues', unread });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ receiver: req.user._id, lu: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};
