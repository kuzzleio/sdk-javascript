try {
  const response = await kuzzle.security.getAllCredentialFields();

  console.log(response);
  /*
  { local: [ 'username', 'password' ],
    facebook: [ ] }
   */
} catch (e) {
  console.error(e);
}
