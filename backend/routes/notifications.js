const router = require('express').Router();
const Notification = require('../models/notification.model');
const { ensureAuthenticated } = require('../middlewares/validation');

// Get all notifications - TEST ONLY
router.route('/').get(async(req, res) => {
  try {
    await Notification.find()
      .sort({ createdAt: -1 })
      .exec((err, notifications) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (notifications === null) return res.status(400).json('No any notifications found');
        else return res.json(notifications);
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Get all user notifications
router.route('/:userId').get(async(req, res) => {
  try {
    await Notification.find({ receiverId: req.params.userId })
      .sort({ createdAt: -1 })
      .exec((err, notifications) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (notifications === null) return res.status(400).json('No any notifications found');
        else return res.json(notifications);
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Mark notification as read
router.route('/').post(ensureAuthenticated, async(req, res) => {
  try {
    console.log(req.body);
    await Notification.updateMany({ _id: { $in: req.body } }, { read: true })
      .exec((err, notifications) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (notifications === null || notifications.nModified === 0) return res.status(400).json('Notifications not found');
        else return res.json('Marked as read');
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
