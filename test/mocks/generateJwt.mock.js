function generateJwt (userId = 'test-user', expiresAt = null) {
  const 
    header = { alg: 'HS256', typ: 'JWT' },
    payload = { _id: userId, iat: Date.now(), exp: expiresAt },
    signature = 'who cares?';

  expiresAt = expiresAt || Date.now() + 3600 * 1000;

  return [ header, payload, signature]
    .map(data => Buffer.from(JSON.stringify(data)).toString('base64'))
    .join('.');
}

module.exports = generateJwt;
