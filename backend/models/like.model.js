const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const likeSchema = new Schema({
  screamId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userHandle: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Like = mongoose.model('Likes', likeSchema);

module.exports = Like;
