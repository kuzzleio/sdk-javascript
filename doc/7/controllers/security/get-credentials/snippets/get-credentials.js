try {
  const response = await kuzzle.security.getCredentials('local', 'john.doe');

  console.log(response);
  /*
  { username: 'jdoe', kuid: 'john.doe' }
   */
} catch (e) {
  console.error(e);
}
