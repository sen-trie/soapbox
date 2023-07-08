const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

require("dotenv").config(); 

authUser = (request, accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/google/callback",
    passReqToCallback   : true
  }, authUser
));

passport.serializeUser( (user, done) => { 
  done(null, user);
})

passport.deserializeUser((user, done) => {
  done(null, user);
}) 