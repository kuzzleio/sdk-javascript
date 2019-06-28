const credentials = { username: 'foo', password: 'bar' };

try {
  const jwt = await kuzzle.auth.login('local', credentials);

  // Prints the encrypted authentication token
  console.log(jwt);

  // Note: to get a different token, you actually need to wait at least
  // 1 second. Otherwise you do receive a refreshed token, but with the exact
  // same caracteristics, as the key depends on the timestamp in Epoch format
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Prints:
  // { _id: '<user kuid>',
  //   jwt: '<a different encrypted authentication token>'
  //   expiresAt: 1553185334220,
  //   ttl: 3600000 }
  console.log(await kuzzle.auth.refreshToken());
} catch (error) {
  console.error(error.message);
}
