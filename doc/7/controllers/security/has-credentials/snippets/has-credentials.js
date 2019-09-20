try {
  const response = await kuzzle.security.hasCredentials('local', 'john.doe');

  console.log(response);
  /*
  true
   */
} catch (e) {
  console.error(e);
}
