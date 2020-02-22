const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  screamId: {
    type: String,
    required: true
  },
  body: {
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

const Comment = mongoose.model('Comments', commentSchema);

module.exports = Comment;
