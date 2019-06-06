const credentials = { username: 'foo', password: 'bar' };

try {
  const jwt = await kuzzle.auth.login('local', credentials);

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
