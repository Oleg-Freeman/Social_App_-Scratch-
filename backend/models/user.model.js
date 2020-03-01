const mongoose = require('mongoose');
// const beautifyUnique = require('mongoose-beautiful-unique-validation');

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
  handle: {
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
  }]
}, {
  timestamps: true
});

// userSchema.plugin(beautifyUnique);
const User = mongoose.model('User', userSchema);

module.exports = User;
