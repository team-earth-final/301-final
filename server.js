'use strict';
// ======================================= add requrments =======================================

require('dotenv').config();
const express = require('express');
const app = express();
const superagent = require('superagent');
const path = require('path')
const client = require('./client');
const methodOverride = require('method-override');

// ======================================= app config =======================================

const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ======================================= routs =======================================

// ======================================= Rout Handelars =======================================

//catchall / 404
app.use('*', (request, response) => response.send('Sorry, that route does not exist.'));

// ======================================= start app =======================================

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
