try {
  const response = await kuzzle.security.getCredentialFields('local');

  console.log(response);
  /*
  [ 'username', 'password' ]
   */
} catch (e) {
  console.error(e);
}
