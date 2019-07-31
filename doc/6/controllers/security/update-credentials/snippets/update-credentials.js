try {
  const response = await kuzzle.security.updateCredentials(
    'local',
    'john.doe',
    {
      username: 'jdoe',
      password: 'newPassword'
    }
  );

  console.log(response);
  /*
  { username: "jdoe" }
   */
} catch (e) {
  console.error(e);
}
