const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const screamSchema = new Schema({
  // screamId: { type: String, required: true },
  userHandle: {
    type: String,
    required: true
  },
  userId: {
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
  imageURL: {
    type: String,
    required: true,
    default: 'https://res.cloudinary.com/freeman999/image/upload/v1581953970/noAvatar_whj5rm.png'
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Likes' }]
}, {
  timestamps: true
}//, { _id: false }
);

const Scream = mongoose.model('Scream', screamSchema);

module.exports = Scream;
