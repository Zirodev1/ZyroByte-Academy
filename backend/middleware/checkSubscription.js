const User = require('../models/User');

const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.subscribed) {
      return res.status(403).json({ message: 'Subscription required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = checkSubscription;
