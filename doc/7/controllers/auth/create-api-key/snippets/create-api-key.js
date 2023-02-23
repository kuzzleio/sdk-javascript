try {
  await kuzzle.auth.login('local', { username: 'john.doe', password: 'password' });

  const apiKey = await kuzzle.auth.createApiKey('Sigfox API key');

  console.log(apiKey);
  /*
  {
    _id: '-fQRa28BsidO6V_wmOcL',
    _source: {
      description: 'Sigfox API key',
      userId: 'john.doe',
      expiresAt: -1,
      ttl: -1,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJqb2huLmRvZSIsImlhdCI6MTU3ODA0OTMxMn0.XO_keW6EtsCGmPzxVJCChU9VREakEECDGg-N5lhCfF8'
    }
  }
  */

  console.log('API key successfully created');

  // Then use it with your client. Note: You don't need to call login after this because this bypasses the authentication system.
  kuzzle.setAPIKey(apiKey._source.token)
} catch (e) {
  console.error(e);
}
