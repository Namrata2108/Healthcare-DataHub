let authorization = {}
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const auth = require('basic-auth');
// var privKey = crypto.randomBytes(64).toString('hex');
// authorization.keygen = function(){
//     var rand = crypto.randomBytes(64).toString('hex');
//     var token = jwt.sign({data:rand}, privKey,{ expiresIn: '1h'});
//     return token
// };
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  
  // Convert private key to PEM format
  const privKey = privateKey.export({
    format: 'pem',
    type: 'pkcs1',
  });
  
  // Convert public key to PEM format
  const pubKey = publicKey.export({
    format: 'pem',
    type: 'pkcs1',
  });

authorization.keygen = function() {
    const rand = crypto.randomBytes(64).toString('hex');
    const token = jwt.sign({ data: rand }, privKey, { algorithm: 'RS256', expiresIn: '1h' });
    return token;
  };
authorization.authenticate = function(token) {
    try {
      var decoded = jwt.verify(token, pubKey, { algorithms: ['RS256'] });
      return true;
    } catch(err) {
      return false;
    }
  };
  
authorization.validateToken = function(req) {
    try {
      this.authenticate(req.headers.authorization.split(" ")[1]);
      return true;
    } catch(err) {
      return false;
    }
  };

// authorization.authenticate = function(token){
//     var decoded = jwt.verify(token, privKey);
//     try {
//         var decoded = jwt.verify(token, privKey);
//       } catch(err) {
//         return false;
//       }
//       return true;
// };
// authorization.validateToken = function(req){
//     try{
//         this.authenticate(req.headers.authorization.split(" ")[1]);
//     }catch(err){
//         return false;
//     }
//     return true;
// }

authorization.auth = auth;
module.exports = authorization;
