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
  postID:{
    type: String,
    required: true
  },
  media: {
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
  },
  board: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0,
  },
}, { timestamps: true })

const Post = mongoose.model('Post', postSchema);
module.exports = Post;