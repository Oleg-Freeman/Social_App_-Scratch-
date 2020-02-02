const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const screamSchema = new Schema({
  userHandle: { type: String, required: true },
  body: { type: String, required: true },
  createAt: [{
    seconds: { type: Date, required: true, default: Date.now },
    nanoseconds: { type: Date, required: true, default: Date.now }
  }]
}, {
  timestamps: true
});

const Scream = mongoose.model('Scream', screamSchema);

module.exports = Scream;
