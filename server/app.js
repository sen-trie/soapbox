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
    .then((posts) => {
      res.send(posts);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    const { displayName, email, id } = req.user;
    User.findOne({ id })
      .then((existingUser) => {
        if (existingUser) {
          res.json({
            loggedIn: true,
            user: { displayName, email, id },
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

app.use(bodyParser.json());

app.post('/api/submit', (req, res) => {
  const { title, body, userID, userName, displayName } = req.body;

  const newPost = new Post({ title, body, userID, userName, displayName });

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
  const { id, email, username, displayName } = req.body;

  const newUser = new User({ id, email, username, displayName });

  User.findOne({ id })
    .then((existingUser) => {
      if (existingUser) {
        console.log('User already exists:', existingUser);
        return;
      } else {
        newUser.save()
          .then((savedUser) => {
            console.log("User saved:", savedUser);
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

