const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const screamSchema = new Schema({
  // screamId: { type: String, required: true },
  userHandle: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  likeCount: {
    type: Number,
    required: true,
    default: 0
  },
  commentCount: {
    type: Number,
    required: true,
    default: 0
  },
  // comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }]
  comments: [{
    body: { type: String },
    userHandle: { type: String }
  }]
}, {
  timestamps: true
}//, { _id: false }
);

const Scream = mongoose.model('Scream', screamSchema);

module.exports = Scream;
