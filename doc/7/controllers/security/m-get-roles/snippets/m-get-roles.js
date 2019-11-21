try {
  const response = await kuzzle.security.mGetRoles([
    'role1',
    'role2',
    'role3'
  ]);

  console.log(response);
  /*
  [ Role {
      _id: 'role1',
      controllers: { '*': [Object] } },
    Role {
      _id: 'role2',
      controllers: { '*': [Object] } },
    Role {
      _id: 'role3',
      controllers: { '*': [Object] } } ]
   */
} catch (e) {
  console.error(e);
}
