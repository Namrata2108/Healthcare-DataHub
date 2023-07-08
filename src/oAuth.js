const express = require('express');
const oauth2orize = require('oauth2orize');
const passport = require('passport');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Create OAuth 2.0 server
const server = oauth2orize.createServer();

// In-memory storage for clients, tokens, and users
const clients = {};
const tokens = {};
const users = {};

// Generate a random token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Exchange authorization code for access token
server.exchange(
  oauth2orize.exchange.authorizationCode((client, code, redirectUri, done) => {
    // Validate the authorization code
    const token = tokens[code];
    if (!token || token.clientId !== client.clientId || token.redirectUri !== redirectUri) {
      return done(null, false);
    }

    // Generate a new access token
    const accessToken = generateToken();

    // Save the token to the tokens storage
    tokens[accessToken] = {
      accessToken: accessToken,
      clientId: client.clientId,
      userId: token.userId,
    };

    // Remove the used authorization code
    delete tokens[code];

    // Return the access token
    return done(null, accessToken);
  })
);

// Issue access tokens to clients
server.serializeClient((client, done) => done(null, client.clientId));
server.deserializeClient((clientId, done) => done(null, clients[clientId]));

// Token endpoint for generating bearer tokens
// app.post('/oauth2/token', [
//   passport.authenticate(['basic'], { session: false }),
//   server.token(),
//   server.errorHandler(),
// ]);

// // Protect a resource using access tokens
// app.get('/api/resource', passport.authenticate('bearer', { session: false }), (req, res) => {
//   // Access token is valid, return the protected resource
//   res.json({ message: 'Protected resource accessed successfully!' });
// });


