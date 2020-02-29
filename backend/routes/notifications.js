const router = require('express').Router();
const Notification = require('../models/notification.model');
const { ensureAuthenticated } = require('../middlewares/validation');

// Get all notifications
router.route('/').get((req, res) => {
  Notification.find()
    .sort({ createdAt: -1 })
    .then(notifications => res.json(notifications))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Mark notification as read
router.route('/add/:notificationId').post(ensureAuthenticated, (req, res) => {
  Notification.findByIdAndUpdate(req.param.notificationId, { read: true })
    .then(() => res.json('Marked as read'))
    .catch(err => res.status(400).json('Error, notification not found: ' + err));
});

module.exports = router;
