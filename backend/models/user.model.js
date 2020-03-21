const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    minlength: 6,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userName: {
    type: String,
    required: true
  },
  birthDay: { type: Date },
  imageURL: {
    type: String,
    required: true,
    default: 'https://res.cloudinary.com/freeman999/image/upload/v1581953970/noAvatar_whj5rm.png'
  },
  bio: { type: String },
  website: { type: String },
  location: { type: String },
  postCount: {
    type: Number,
    required: true,
    default: 0
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Posts'
  }],
  isAuthenticated: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
