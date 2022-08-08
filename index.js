var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
require('dotenv').config()

const path = require('path')

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;
const FRONTEND_URI = process.env.FRONTEND_URI;

var app = express();

app.use(express.static(__dirname + '/build'))
app.use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {
  console.log("1");
  res.status(200).send({Hello: "World"})
});



console.log('Listening on 3001');
app.listen(3001);