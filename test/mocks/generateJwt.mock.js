function generateJwt(userId = "test-user", expiresAt = null) {
  const header = { alg: "HS256", typ: "JWT" },
    payload = {
      _id: userId,
      iat: Math.round(Date.now() / 1000),
      exp: expiresAt,
    },
    signature = "who cares?";

  expiresAt = expiresAt || Math.round(Date.now() / 1000) + 3600 * 1000;

  return [header, payload, signature]
    .map((data) => Buffer.from(JSON.stringify(data)).toString("base64"))
    .join(".");
}

module.exports = generateJwt;
