try {
  const response = await kuzzle.security.getCredentialsById('local', 'jdoe');

  console.log(response);
  /*
  { username: 'jdoe', kuid: 'john.doe' }
   */
} catch (e) {
  console.error(e);
}
