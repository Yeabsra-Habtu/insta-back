const User = require('../models/User');

const requireRole = (role) => async (req, res, next) => {
  const userId = req.session.userId;
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== role) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { requireRole };
