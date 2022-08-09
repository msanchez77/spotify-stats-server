const spotifyRouter = require("express").Router();
var queryString = require('querystring');
const axios = require('axios');
require("dotenv").config();


const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID; // Your client id
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET; // Your secret
const CALLBACK_URL = process.env.CALLBACK_URL; // Your redirect uri
const FRONTEND_URI = process.env.FRONTEND_URI;

var stateKey = 'spotify_auth_state';

const scopes = [
  'user-read-private',
  'user-read-email',
  'user-read-recently-played',
  'user-top-read',
  'user-follow-read',
  'user-follow-modify',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private'
];

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const Request = (params) => axios({
  url: 'https://accounts.spotify.com/api/token',
  method: 'POST',
  params,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

spotifyRouter.get('/login', function(_, res) {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
	return res.redirect(
		`https://accounts.spotify.com/authorize?${queryString.stringify({
			response_type: 'code',
			client_id: CLIENT_ID,
			scope: scopes.join(' '),
			redirect_uri: CALLBACK_URL,
			state: state,
			show_dialog: true
		})}`
	);

});

spotifyRouter.get('/callback', async function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    return res.redirect(
      `${FRONTEND_URI}/#${queryString.stringify({ error: 'state_mismatch' })}`
    );
  }
	
  try {
    const params = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: CALLBACK_URL,
      code
    }

    const { data: { access_token, refresh_token } } = await Request(params);
    
    res.redirect(
      `${FRONTEND_URI}/spotify#${queryString.stringify({
        access_token,
        refresh_token
      })}`,
    );
  } catch (e) {
    res.redirect(`${FRONTEND_URI}/#${queryString.stringify({ error: 'invalid_token' })}`);
  }
});

spotifyRouter.get('/refresh_token', async (req, res) => {
  const { refresh_token } = req.query;

  if (!refresh_token) return res.status(401).send('Invalid refresh token');

  try {
    const params = {
      refresh_token,
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }

    const { data: { access_token } } = await Request(params);
    
    res.json({
      access_token
    });
  } catch (e) {
    res.status(401).send('Invalid token');
  }
});

module.exports = spotifyRouter;