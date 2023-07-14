const User = require('../models/user');

const byUsername = (req, res) => {
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
}

const authenticate = (req, res) => {
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
}

const byId =  (req, res) => {
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
}

const createName = (req, res) => {
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
}

module.exports = {
    byUsername, authenticate, byId, createName
}