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
app.get('/getOthersData', getOthersData);

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

  let user_id;
  // get top artist
  await superagent.get("https://api.spotify.com/v1/me/top/artists?limit=1&offset=0")
    .auth(req.user.accessToken, { type: 'bearer' })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json')
    .then(data => {
      const sqlString = 'INSERT INTO app_users(fave_artist, spotify_user_id, display_name) VALUES($1, $2, $3) ON CONFLICT(spotify_user_id) DO UPDATE SET fave_artist=EXCLUDED.fave_artist RETURNING id;';
      const sqlArray = [
        data.body.items[0].name,
        req.user.id,
        req.user.displayName
      ];
      client.query(sqlString, sqlArray)
        .then(result => {
          user_id = result.rows[0].id;
        })
        .catch(handelError(res));
    });

  // top 50 songs
  await superagent.get("https://api.spotify.com/v1/me/top/tracks?limit=50&offset=0")
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
              //get genre
              superagent.get(`https://api.spotify.com/v1/artists/${track.artists[0].id}`)
                .auth(req.user.accessToken, { type: 'bearer' })
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .then(data => {
                  let genres = data.body.genres.join(' | ')
                  let album_cover_url;
                  //get artowrk
                  const search_url = 'https://api.genius.com/search?q=' + track.name + ' ' + track.album.name
                  superagent.get(search_url)
                    .auth(process.env.GENIOUS_TOKEN, { type: 'bearer' })
                    .then(result => {
                      console.log(result.body.response.hits[0].result.song_art_image_thumbnail_url);
                      album_cover_url = result.body.response.hits[0].result.song_art_image_thumbnail_url;
                      const sqlString = 'INSERT INTO tracks(track_name, artist, album_name, release_date, genres, spotify_track_id, preview_url, app_user_id, user_rank, global_plays, user_plays, popularity, album_cover_url) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);';
                      const sqlArray = [
                        track.name,
                        track.artists[0].name,
                        track.album.name,
                        track.album.release_date,
                        genres,
                        track.id,
                        track.preview_url,
                        user_id,
                        rank,
                        '-1', //later
                        '-1', //potential stretch
                        track.popularity,
                        album_cover_url
                      ];
                      client.query(sqlString, sqlArray)
                        .catch(handelError(res));
                      rank++;
                    })
                });
            };
          });
      })
    })
  res.redirect(`/getUserData/${user_id}`)
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
  let sqlSelect = `SELECT
  fave_artist,
  display_name,
  app_users.id,
  spotify_user_id,
  track_name,
  release_date,
  preview_url
  FROM app_users 
  LEFT OUTER JOIN tracks ON tracks.app_user_id=app_users.id
  WHERE app_users.id=${req.params.id}
  AND tracks.user_rank =1;`;
  await client.query(sqlSelect)
    .then(result => { userObject = result.rows[0] })
    .catch(handelError(res))
  if (!(userObject)){
    res.send('Sorry, that route does not exist.');
    return;
  }
    sqlSelect = `SELECT * FROM tracks WHERE app_user_id=${userObject.id};`;
  await client.query(sqlSelect)
    .then(result => { tracks = result.rows; })
    .catch(handelError(res));
  tracks = tracks ? tracks : [];
  res.render('user_stats', { userObject, tracks, title: `${userObject.display_name} User Stats` });
}

async function getTrackData(req, res) {
  let track;
  let geniousData;

  const sqlSelect = `SELECT * FROM tracks WHERE id=${req.params.id}`;
  await client.query(sqlSelect)
    .then(result => track = result.rows[0])
    .catch(handelError(res));

  //get lyrics
  const search_url = 'https://api.genius.com/search?q=' + track.track_name + ' ' + track.artist
  await superagent.get(search_url)
    .auth(process.env.GENIOUS_TOKEN, { type: 'bearer' })
    .then(result => {
      console.log(result.body.response.hits[0].result);
      geniousData = result.body.response.hits[0].result
    })

  res.render('track_details', { track, geniousData });
}

async function getOthersData(req, res) {
  let userObjects;
  let sqlSelect = `SELECT display_name, id FROM app_users`;
  await client.query(sqlSelect)
    .then(result => { userObjects = result.rows })
    .catch(handelError(res));
  console.log(userObjects);
  res.render('others_stats', { userObjects, title: 'Other Users Stats' });
}

//catchall / 404
app.use('*', (request, response) => response.send('Sorry, that route does not exist.'));


// ======================================= start app =======================================


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
