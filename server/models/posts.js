const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
  },
  userID: {
    type: String,
  },
  displayName: {
    type: String,
  },
  userName: {
    type: String,
  }
}, { timestamps: true })

const Post = mongoose.model('Post', postSchema);
module.exports = Post