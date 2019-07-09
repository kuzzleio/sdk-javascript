try {
  await kuzzle.security.createUser('foo', {
    content: {
      profileIds: ['default'],
      fullName: 'John Doe'
    },
    credentials: {}
  });

  const response = await kuzzle.security.createCredentials(
    'local',
    'foo',
    { username: 'foo', password: 'bar' }
  );
  console.log(response);
  /*
    { username: 'foo' }
  */

  console.log('Credentials successfully created');
} catch (e) {
  console.error(e);
}
