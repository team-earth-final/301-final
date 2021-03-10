'use strict';
// ======================================= add requrments =======================================

require('dotenv').config();
const express = require('express');
const app = express();
const superagent = require('superagent');
const path = require('path');
const client = require('./client');
const methodOverride = require('method-override');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const session = require('express-session');


// ======================================= app config =======================================

const PORT = process.env.PORT || 3000;
const client_id = process.env.CLIENT_ID; // Spotify client id
const client_secret = process.env.CLIENT_SECRET; // spotify Client secret
const authCallbackPath = '/auth/spotify/callback';
const redirect_uri = process.env.REDIRECT_URI; // redirect uri


app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, 'public')));
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
app.get(authCallbackPath, checkLogin(), (req, res) => { initialUserDataPull(req, res); });
app.get('/', getlanding);
app.get('/getUserData/:id', getUserData);
app.get('/getTrackData/:id', getTrackData);

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
    console.log(err);
    // let user know we messed up
    res.status(500).render("error", { err: err, title: 'Error' });
  };
}

async function initialUserDataPull(req, res) {
  console.log(req.user.accessToken);

  let user_id;
  // get top artist
  await superagent.get("https://api.spotify.com/v1/me/top/artists?limit=1&offset=0")
    .auth(req.user.accessToken, { type: 'bearer' })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .then(data => {
      const sqlString = 'INSERT INTO app_users(fave_artist, spotify_user_id) VALUES($1, $2) ON CONFLICT(spotify_user_id) DO UPDATE SET fave_artist=EXCLUDED.fave_artist RETURNING id;';
      const sqlArray = [
        data.body.items[0].name,
        req.user.id
      ];
      client.query(sqlString, sqlArray)
        .then(result => {
          user_id = result.rows[0].id;
        })
        .catch(handelError(res));
    });


  // //get person top song
  // await superagent.get("https://api.spotify.com/v1/me/top/tracks?limit=1&offset=0")
  //   .auth(req.user.accessToken, { type: 'bearer' })
  //   .set('Accept', 'application/json')
  //   .set('Content-Type', 'application/json')
  //   .then(data => {

  //     // getTopSong(); //gets song details from spotify
  //     superagent.get(`https://api.spotify.com/v1/tracks/${data.body.items[0].id}`)
  //       .auth(req.user.accessToken, { type: 'bearer' })
  //       .set('Accept', 'application/json')
  //       .set('Content-Type', 'application/json')
  //       .then(data => {
  //         const sqlString = 'INSERT INTO tracks (track_name, artist, album, release_date, genre, spotify_track_id, preview_url, app_user_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8);';
  //         console.log(user_id);
  //         const sqlArray = [
  //           data.body.name,
  //           data.body.artists[0].name,
  //           data.body.album.name,
  //           data.body.album.release_date,
  //           'todo get genre', //later
  //           data.body.id,
  //           data.body.preview_url,
  //           user_id
  //         ];
  //         client.query(sqlString, sqlArray);
  //       }).catch(handelError(res));
  //   });


  // top 50 songs
  superagent.get("https://api.spotify.com/v1/me/top/tracks?limit=50&offset=0")
    .auth(req.user.accessToken, { type: 'bearer' })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .then(data => {
      let rank = 1;
      data.body.items.forEach(track => {
        const sqlString = 'SELECT * FROM tracks WHERE track_name =$1';
        const sqlArray = [track.name];
        client.query(sqlString, sqlArray)
          .then(dataFromDatabase => {
            if (dataFromDatabase.rows.length === 0) {
              const sqlString = 'INSERT INTO tracks(track_name, artist, album, release_date, genre, spotify_track_id, preview_url, app_user_id, user_rank, global_plays, user_plays, popularity) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);';
              const sqlArray = [
                track.name, //track_name
                track.artists[0].name,
                track.album.name,
                track.album.release_date,
                'todo get genre', //later
                track.id,
                track.preview_url,
                user_id,
                rank,
                '-1', //later
                '-1', //potential stretch
                track.popularity
              ];
              client.query(sqlString, sqlArray)
                .catch(handelError(res));
              rank++;
            };
          });
      })
    })
  res.redirect('/')
}
app.get('/getTracks', getTracksFRomDatabase)
function getTracksFRomDatabase(req, res) {
  client.query('SELECT * FROM tracks')
    .then(data => {
    })
}

app.get('/aboutTeamEarth', redirectToAboutTeamEarth)
function redirectToAboutTeamEarth(req, res) {
  res.render('aboutTeamEarth')
}

// todo refernce to individual stat page
function getlanding(req, res) {
  res.render('index', { user: req.user });
}

async function getUserData(req, res) {
  let userObject;
  let tracks;

  let sqlSelect = `SELECT * FROM app_users WHERE id=${req.params.id};`;
  await client.query(sqlSelect)
    .then(result => { userObject = result.rows[0] })
    .catch(handelError(res))

  sqlSelect = `SELECT * FROM tracks WHERE app_user_id=${userObject.id};`;
  console.log(sqlSelect);
  await client.query(sqlSelect)
    .then(result => { tracks = result.rows })
    .catch(handelError(res))

  res.render('user_stats', { userObject, tracks });
}

function getTrackData(req, res) {
  let track;

  const sqlSelect = `SELECT * FROM tracks WHERE id=${req.params.id}`;
  client.query(sqlSelect)
    .then(result => track = result.rows[0])
    .catch(handelError(res));

  // track = {
  //   track_title: 'blah',
  //   lyrics: 'we sing words',
  //   release_date: '1999',
  //   album_cover_url: 'url',
  //   artist: 'singer person',
  //   popularity: '99',
  //   genre: 'pop',
  //   album_name: 'dope ep',
  //   last_time_user_played: 'date or never',
  //   global_play_count: '6712348',
  //   users_play_count: '43'
  // };
  res.render('track_stats', { track });
}

//catchall / 404
app.use('*', (request, response) => response.send('Sorry, that route does not exist.'));


// ======================================= start app =======================================


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
