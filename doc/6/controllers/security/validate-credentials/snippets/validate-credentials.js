try {
  const response = await kuzzle.security.validateCredentials(
    'local',
    'john.doe',
    {
      username: 'jdoe',
      password: 'password'
    }
  );

  console.log(response);
  /*
  true
   */

} catch (e) {
  console.error(e);
}
