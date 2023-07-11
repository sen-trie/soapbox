const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const Post = require('./models/posts');
const User = require('./models/user');
const Reply = require('./models/reply');
const boards = require('../shared/boards');

const Counter = mongoose.model('Counter', {
  anime: Number,
  fitness: Number,
  gaming: Number,
  nature: Number,
  science: Number,
  technology: Number,
}, 'counter');

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

app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      return res.redirect('/auth/google/failure');
    } else if (!user) {
      return res.redirect('/auth/google/failure');
    }

    User.findOne({ id: user.id })
      .then((existingUser) => {
        if (existingUser) {
          req.login(existingUser, (err) => {
            if (err) {
              console.error('Error during login:', err);
              return res.redirect('/auth/google/failure');
            }
            return res.redirect('/');
          });
        } else {
          res.redirect(`/choose-display-name?Id=${user.id}&email=${user.email}&googleName=${user.displayName}`);
        }
      })
      .catch((error) => {
        console.error('Error checking existing user:', error);
        return res.redirect('/auth/google/failure');
      });
  })(req, res, next);
});

app.get('/api/items', (req, res) => {
  Post.find()
    .sort({ createdAt: -1 })
    .then((posts) => {
      res.send(posts);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500)
    });
});

app.get('/api/items/:param', (req, res) => {
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
});

app.get(`/api/replies/:param`, (req, res) => {
  const param = req.params.param;
  const [key, value] = param.split(':');
  let find;

  if (key === 'uid') {
    find = { postId: value }
  } else if (key === 'user') {
    find = { 'user.id': value }
  } else {
    res.sendStatus(400)
    return;
  }

  Reply.find(find)
    .then((replies) => {
      if (key === 'user') {
        const postIDs = replies.map((reply) => reply.postId);

        Post.find({ _id: { $in: postIDs } })
          .then((posts) => {
            const combinedData = [];

            for (let i = 0; i < replies.length; i++) {
              let findPostId = replies[i].postId
              for (let j = 0; j < posts.length; j++) {
                if (findPostId === posts[j]._id.toString()) {
                  
                  combinedData.push({post:posts[j], reply:replies[i]});
                  break;
                }
              }
            }

            res.send({ combinedData });
          })
          .catch((error) => {
            console.error('Error retrieving posts:', error);
            res.sendStatus(500);
          });
      } else {
        res.send(replies);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500)
    });
})

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    const { displayName, email, username, id } = req.user;

    User.findOne({ id })
      .then((existingUser) => {
        if (existingUser) {
          // PREVENTS EMAIL FROM BEING SENT TO CLIENT
          existingUser.email = null;
          res.json({
            loggedIn: true,
            user: { displayName, username, id },
            existingUser: existingUser
          });
        } else {
          res.redirect(`/choose-display-name?Id=${id}&email=${email}&googleName=${displayName}`);
        }
      })
      .catch((error) => {
        console.error('Error checking existing user:', error);
      });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get('/api/user/:username', (req, res) => {
  const username = req.params;

  User.findOne(username)
    .then((user) => {
      const { id, username, displayName, createdAt } = user;
      // ONLY GIVES CLIENT ID, USERNAME, DISPLAY NAME AND CREATION DATE
      const scrubbedUser = { id, username, displayName, createdAt };
      res.json({ user: scrubbedUser });
    })
    .catch((err) => {
      res.sendStatus(500)
    });
});


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
    const { postId, text, user, replies } = req.body.data;

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
          postId, text, user, replies,
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

app.post('/api/submit', async (req, res) => {
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
});

app.post('/api/createName', (req, res) => {
  const { id, email, username, displayName, liked } = req.body;

  const newUser = new User({ id, email, username, displayName, liked });

  User.findOne({ id })
    .then((existingUser) => {
      if (existingUser) {
        console.log('User already exists:', existingUser);
        return;
      } else {
        newUser.save()
          .then((savedUser) => {
            console.log("User saved:", savedUser);
            // BUG NOT LOGIN AFTERWARDS
            res.redirect('/');
          })
          .catch((error) => {
            console.error("Error saving name:", error);
            res.sendStatus(500);
          });
        }
      })
    .catch((error) => {
      console.error('Error checking existing user:', error);
    });
  });

app.post('/api/authenticate', (req, res) => {
  if (req.isAuthenticated()) {
    const { displayName, email, id } = req.user;

    User.findOne({ id })
      .then((existingUser) => {
        if (existingUser) {
          console.log('User already exists:', existingUser);
          return;
        } else {
          res.redirect(`/choose-display-name?Id=${id}&email=${email}&googleName=${displayName}`);
        }
      })
      .catch((error) => {
        console.error('Error checking existing user:', error);
      });
  }
  
  res.sendStatus(200);
});

app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

