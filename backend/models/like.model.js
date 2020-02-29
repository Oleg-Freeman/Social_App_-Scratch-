const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const likeSchema = new Schema({
  screamId: {
    type: String,
    required: true
  },
  commentId: {
    type: String
  },
  userId: {
    type: String,
    required: true
  },
  userHandle: {
    type: String,
    required: true
  },
  likeType: {
    type: String,
    enum: ['scream', 'comment'],
    required: true
  }
}, {
  timestamps: true
});

const Like = mongoose.model('Likes', likeSchema);

module.exports = Like;
