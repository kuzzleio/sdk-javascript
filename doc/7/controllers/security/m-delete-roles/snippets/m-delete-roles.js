try {
  const response = await kuzzle.security.mDeleteRoles([
    'role1',
    'role2',
    'role3',
    'role4',
    'role5'
  ]);

  console.log(response);
  /*
  [ 'role1', 'role2', 'role3', 'role4', 'role5' ]
   */
} catch (e) {
  console.error(e);
}
