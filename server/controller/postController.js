const Post = require('../models/posts');
const Reply = require('../models/reply');

const postAll = (req, res) => {
  Post.find()
    .sort({ createdAt: -1 })
    .then((posts) => {
      res.send(posts);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500)
    });
}

const postParam =  (req, res) => {
    const param = req.params.param;
    const [key, value] = param.split(':');
    let find;
  
    if (key === 'id') {
      find = { userID: value }
    } else if (key === 'board') {
      find = { board: value }
    } else if (key === 'uid') {
      find = { _id: value }
    } else if (key === 'countReply') {
      find = { _id: value }
    } else {
      res.sendStatus(400);
      return;
    }
  
    if (key === 'countReply') {
      Reply.countDocuments({ postId: value })
        .then((number) => {
          res.json({ number })
        })
        .catch((err) => {
          console.error(err);
          res.sendStatus(500)
        })
    } else {
      Post.find(find)
        .sort({ createdAt: -1 })
        .then((posts) => {
          res.send(posts);
        })
        .catch((err) => {
          const error = { message: "An internal serval error occurred" };
          res.status(500).json(error);
        });
    }
}

const submit = async (req, res) => {
    const { title, body, userID, userName, displayName, board, likes, replies } = req.body;
  
    try {
      const updatedCounter = await Counter.findByIdAndUpdate( '64ab99fd99eb639ccf2abbf5', { $inc: { [board]: 1 } });
  
      if (updatedCounter) {
        const postID = `${boards[board]}-P:${updatedCounter.toObject()[board]}`;
        const newPost = new Post({ title, body, userID, postID, userName, displayName, board, likes, replies });
        newPost.save()
          .then((savedPost) => {
            console.log("Post saved:", savedPost);
            res.sendStatus(200);
          })
          .catch((error) => {
            console.error("Error saving post:", error);
            res.sendStatus(500);
          });
      }
    } catch (err) {
      console.error('Error creating post:', err);
      res.sendStatus(500);
    }
  }

module.exports = {
  postAll, postParam, submit
}