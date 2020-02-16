const mongoose = require('mongoose');
// const beautifyUnique = require('mongoose-beautiful-unique-validation');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, minlength: 6 },
  password: { type: String, required: true, minlength: 6 },
  // confirmPassword: { type: String, required: true, minlength: 6 },
  handle: { type: String, required: true }

}, {
  timestamps: true
});

// userSchema.plugin(beautifyUnique);
const User = mongoose.model('User', userSchema);

module.exports = User;
