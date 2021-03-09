'use strict';
// ======================================= add requrments =======================================

require('dotenv').config();
const express = require('express');
const app = express();
const superagent = require('superagent');
const path = require('path')
const client = require('./client');
const methodOverride = require('method-override');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const session = require('express-session')

// ======================================= app config =======================================

const PORT = process.env.PORT || 3000;
const client_id = process.env.CLIENT_ID; // Spotify client id
const client_secret = process.env.CLIENT_SECRET; // spotify Client secret
const authCallbackPath = '/auth/spotify/callback';
const redirect_uri = process.env.REDIRECT_URI; // redirect uri


app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ======================================= Rout Handelars =======================================

//config passport to use OAuth2 with Spotify.
passport.serializeUser(function (user, done) { done(null, user); });
passport.deserializeUser(function (obj, done) { done(null, obj); });

passport.use(
  new SpotifyStrategy(
    {
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL: redirect_uri + PORT + authCallbackPath,
    },
    // from; https://github.com/JMPerez/passport-spotify/blob/master/examples/login/app.js
    function (accessToken, refreshToken, expires_in, profile, done) {
      process.nextTick(function () {
        // To keep the example simple, the user's spotify profile is returned to
        // represent the logged-in user. In a typical application, you would want
        // to associate the spotify account with a user record in your database,
        // and return that user instead.

        //set access and refresh tokens
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
        return done(null, profile);
      });
    }
  )
);
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
//Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// ======================================= routs =======================================

app.get('/auth/spotify', authUserWithScopes());
app.get(authCallbackPath, checkLogin(), (req, res) => { exampleApiCall(req, res); });
app.get('/', getlanding);
app.get('/sampleUseInfo', getUserData);


// ======================================= Rout Handelars =======================================

function checkLogin() {
  return passport.authenticate('spotify', { failureRedirect: '/login' });
}

function authUserWithScopes() {
  return passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private', 'user-top-read'],
    showDialog: true,
  });
}

function handelError(res) {
  return err => {
    //log error
    console.log(err)
    // let user know we messed up
    res.status(500).render("error", { err: err });
  };
}

function exampleApiCall(req, res) {
  superagent.get("https://api.spotify.com/v1/me/top/tracks?limit=1&offset=1")
    .auth(req.user.accessToken, { type: 'bearer' })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .then(data => {
      console.log('1234asdf');
      console.log(data.body);
      res.redirect('/');
    }).catch(handelError(res));
}

function getlanding(req, res) {
  res.render('index', { user: req.user })
}

function getUserData(req, res) {
  passport.authenticate()
}

//catchall / 404
app.use('*', (request, response) => response.send('Sorry, that route does not exist.'));

// ======================================= start app =======================================

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
