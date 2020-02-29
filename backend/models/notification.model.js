const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true
  },
  receiverName: {
    type: String,
    required: true
  },
  screamId: {
    type: String,
    required: true
  },
  commentId: {
    type: String
  },
  read: {
    type: Boolean,
    required: true,
    default: false
  },
  notificationType: {
    type: String,
    enum: ['like-scream', 'like-comment', 'new-comment'],
    required: true
  }
}, {
  timestamps: true // Adds Created At & Modified At fields
});

const Notification = mongoose.model('Notifications', notificationSchema);

module.exports = Notification;
