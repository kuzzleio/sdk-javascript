const credentials = { username: 'foo', password: 'bar' };

try {
  const jwt = await kuzzle.auth.login('local', credentials);

  // Check the internal jwt validity
  await kuzzle.auth.checkToken();

  // Check the jwt validity
  const result = await kuzzle.auth.checkToken(jwt);
  console.log(result);
  /*
    { valid: true, expiresAt: 1540824822897 }
  */

  if (result.valid) {
    console.log('Token is valid');
  } else {
    console.error(`Token is invalid: ${result.state}`);
  }
} catch (error) {
  console.error(error.message);
}
