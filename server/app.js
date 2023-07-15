const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const Post = require('./models/posts');
const User = require('./models/user');
const Reply = require('./models/reply');
const Counter = require('./models/counter');
const boards = require('../shared/boards');

const userController = require('./controller/userController');
const postController = require('./controller/postController');
const replyController = require('./controller/replyController');

const session = require('express-session');
const passport = require('passport');
require('./auth');

require("dotenv").config(); 

const app = express();
const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => app.listen(PORT, () => {
    console.log('SERVER STARTED');
  }))
  .catch((err) => console.error(err))

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '../client/build')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile', 'openid' ] }
));

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get('/auth/google/callback', userController.googleCallback);

app.get('/api/items', postController.postAll);

app.get('/api/items/:param', postController.postParam);

app.delete('/api/items/:postId', postController.deleteById);

app.get('/profile', userController.byId);

app.get('/api/user/:username', userController.byUsername);

app.use(bodyParser.json());

app.get(`/api/replies/:param`, replyController.findReply);

app.post('/api/submit', postController.submit);

app.post('/api/createName', userController.createName);

app.post('/api/authenticate', userController.authenticate);

app.put(`/api/delReply/:param`, replyController.deleteReply);

app.put('/api/posts/:param', async (req, res) => {
  const param = req.params.param.split(':');
  const postId = param[0];
  const userId = param[1];

  const action = req.body.action;

  const session = await mongoose.startSession();
  session.startTransaction();

  let shouldAbort = false;
  if (action === 'upvote' || action === 'downvote') {
    const postUpdate = action === 'upvote' ? { $inc: { likes: 1 } } : { $inc: { likes: -1 } };
    const userUpdate = action === 'upvote' ? { $push: { liked: postId } } : { $pull: { liked: postId } };

    try {
      const updatedPost = await Post.findOneAndUpdate({ _id: postId }, postUpdate, { new: true }).session(session);
      if (!updatedPost) {
        console.log('Post not found');
        shouldAbort = true;
      }

      const userUpdateResult = await User.updateOne({ id: userId }, userUpdate).session(session);
      if (userUpdateResult.modifiedCount === 0) {
        console.log('User not found');
        shouldAbort = true;
      }

      if (userUpdateResult.modifiedCount > 0 && updatedPost) {
        console.log('Upvote/Downvote successful');
      }
    } catch (error) {
      console.error('Error updating post and user:', error);
      shouldAbort = true;
    }
  } else if (action === 'comment') {
    const board = req.body.board;
    const { postId, postUid, text, user, replies, media } = req.body.data;

    let replyArray = text.match(/->[A-Z]+:\d+\b/g);
    if (replyArray) {
      replyArray = replyArray.map((str) => str.replace(/->/g, ''));
    }

    try {
      const updatedCounter = await Counter.findByIdAndUpdate( '64ab99fd99eb639ccf2abbf5', { $inc: { [board]: 1 } }).session(session);

      if (updatedCounter) {
        const replyId = `${boards[board]}:${updatedCounter.toObject()[board]}`;

        if (replyArray) {
          replyArray.forEach(async (value) => {
            await Reply.updateOne({ replyId: value }, { $push: { replies: replyId } }).session(session);
          });
        }

        const newReply = new Reply({
          postId, postUid, text, replies, media,
          replyId: replyId,
          user: { _id: user._id, username: user.username, displayName: user.displayName}
        });

        await newReply.save();
        await Post.findByIdAndUpdate(postId, { $push: { replies: replyId } }, { new: true }).session(session);

        console.log("Post saved:");
      } else {
        shouldAbort = true;
        console.error('Error replying', err);
      }
    } catch (err) {
      shouldAbort = true;
      console.error('Error replying', err);
    }
  }

  if (shouldAbort) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Error replying' });
  } else {
    await session.commitTransaction();
    res.status(200).json({ message: 'OK' });
  }
});

app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

