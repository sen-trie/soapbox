const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const replySchema = new Schema({
  postId: {
    type: String,
    required: true,
  },
  replyId:{
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  media:{
    type: String,
  },
  user: {
    type: Object,
    default: {}
  },
  replies: {
    type: Array,
    default: []
  }
}, { timestamps: true })

const Reply = mongoose.model('reply', replySchema);
module.exports = Reply;