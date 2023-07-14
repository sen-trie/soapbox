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

app.get(`/api/replies/:param`, replyController.findReply)

app.get('/profile', userController.byId);

app.get('/api/user/:username', userController.byUsername);

app.use(bodyParser.json());

app.put('/api/posts/:param', async (req, res) => {
  const param = req.params.param.split(':');
  const postId = param[0];
  const userId = param[1];

  const action = req.body.action;

  if (action === 'upvote' || action === 'downvote') {
    const postUpdate = action === 'upvote' ? { $inc: { likes: 1 } } : { $inc: { likes: -1 } };
    const userUpdate = action === 'upvote' ? { $push: { liked: postId } } : { $pull: { liked: postId } };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updatedPost = await Post.findOneAndUpdate({ _id: postId }, postUpdate, { new: true }).session(session);
      if (!updatedPost) {
        console.log('Post not found');
        await session.abortTransaction();
        session.endSession();
        res.sendStatus(404);
      }

      const userUpdateResult = await User.updateOne({ id: userId }, userUpdate).session(session);
      if (userUpdateResult.modifiedCount === 0) {
        console.log('User not found');
        await session.abortTransaction();
        session.endSession();
        res.sendStatus(404);
      }

      if (userUpdateResult.modifiedCount > 0 && updatedPost) {
        console.log('Upvote/Downvote successful');
        res.json({ post: updatedPost });
        await session.commitTransaction();
        session.endSession();
      }
    } catch (error) {
      console.error('Error updating post and user:', error);
      await session.abortTransaction();
      session.endSession();
      res.sendStatus(500);
    }
  } else if (action === 'comment') {
    const board = req.body.board;
    const { postId, text, user, replies, media } = req.body.data;

    let replyArray = text.match(/->[A-Z]+:\d+\b/g);
    if (replyArray) {
      replyArray = replyArray.map((str) => str.replace(/->/g, ''));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updatedCounter = await Counter.findByIdAndUpdate( '64ab99fd99eb639ccf2abbf5', { $inc: { [board]: 1 } });

      if (updatedCounter) {
        const replyId = `${boards[board]}:${updatedCounter.toObject()[board]}`;

        if (replyArray) {
          replyArray.forEach(async (value) => {
            await Reply.updateOne({ replyId: value }, { $push: { replies: replyId } })
          });
        }

        const newReply = new Reply({
          postId, text, user, replies, media,
          replyId: replyId
        });

        newReply.save()
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
      console.error('Error replying', err);
      return res.status(500).json({ error: 'Error replying' });
    }
  }
});

app.post('/api/submit', postController.submit);

app.post('/api/createName', userController.createName);

app.post('/api/authenticate', userController.authenticate);

app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

