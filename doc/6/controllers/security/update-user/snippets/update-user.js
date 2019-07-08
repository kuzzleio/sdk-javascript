try {
  const response = await kuzzle.security.updateUser(
    'john.doe',
    {
      profileIds: ['default'],
      firstName: 'John',
      lastName: 'Doe'
    }
  );

  console.log(response);
  /*

   */

} catch (e) {
  console.error(e);
}
