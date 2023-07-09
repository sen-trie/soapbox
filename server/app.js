const express = require('express');
const path = require('path');
const mongoose = require("mongoose");
const Post = require('./models/posts');
const bodyParser = require("body-parser");

const User = require('./models/user');

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
      res.status(500).send('Internal Server Error');
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
  } else {
    res.status(400).send('Invalid parameter');
    return;
  }

  Post.find( find )
    .sort({ createdAt: -1 })
    .then((posts) => {
      res.send( posts );
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    const { displayName, email, username, id } = req.user;

    User.findOne({ id })
      .then((existingUser) => {
        if (existingUser) {
          // END USERS DO NOT NEED THEIR EMAIL RETURNED
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
      const { id, username, displayName, createdAt } = user; // Extract desired keys from the user object
      const scrubbedUser = { id, username, displayName, createdAt }; // Create a new object with the extracted keys
      res.json({ user: scrubbedUser });
    })
    .catch((err) => {
      // console.error(err);
      res.status(500).send('Internal Server Error');
    });
})

app.use(bodyParser.json());

app.put('/api/posts/:param', async (req, res) => {
  
  const param = req.params.param.split(':');
  const postId = param[0];
  const userId = param[1];

  const action = req.body.action; // 'upvote' or 'downvote'

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

  
})

app.post('/api/submit', (req, res) => {
  const { title, body, userID, userName, displayName, board, likes } = req.body;

  const newPost = new Post({ title, body, userID, userName, displayName, board, likes });
  newPost.save()
    .then((savedPost) => {
      console.log("Post saved:", savedPost);
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error("Error saving post:", error);
      res.sendStatus(500);
    });
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

