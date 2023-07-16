const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const replySchema = new Schema({
  postId: {
    type: String,
    required: true,
  },
  postUid : {
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
    default: {},
    required: true,
  },
  replies: {
    type: Array,
    default: [],
    required: true,
  },
  deleted: {
    type: Boolean,
    default: false,
    required: true,
  }
}, { timestamps: true })

const Reply = mongoose.model('reply', replySchema);
module.exports = Reply;