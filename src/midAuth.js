const jwt = require('jsonwebtoken')
const jwksRsa = require('jwks-rsa')

const jwksClient = jwksRsa({
  jwksUri: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_YuZttYiPL/.well-known/jwks.json'
})

function getKey(header, callback) {
  jwksClient.getSigningKey(header.kid, function (err, key) {
    if (err) {
      return callback(err)
    }
    const signingKey = key.getPublicKey()
    callback(null, signingKey)
  })
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.sendStatus(401)

  jwt.verify(token, getKey, {
    algorithms: ['RS256'],
    issuer: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_YuZttYiPL'
  }, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token verification failed', details: err.message })
    req.user = decoded
    next()
  })
}

module.exports = authenticateToken
