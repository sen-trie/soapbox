const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  liked: {
    type: Array,
    required: true
  },
  admin: {
    type: Boolean,
    default: false,
    required: true,
  }
}, { timestamps: true })

const User = mongoose.model('User', userSchema);
module.exports = User;