const credentials = { username: 'foo', password: 'bar' };

try {
  await kuzzle.auth.login('local', credentials);

  const user = await kuzzle.auth.getCurrentUser();

  const profiles = await user.getProfiles();
  console.log(profiles);
  /*
    [
      Profile {
        _id: 'default',
        policies: [
          {
            roleId: 'default'
          }
        ]
      }
    ]
  */
} catch (error) {
  console.error(error.message);
}
