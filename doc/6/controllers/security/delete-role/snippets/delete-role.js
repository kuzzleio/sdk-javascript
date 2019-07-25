try {
  const response = await kuzzle.security.deleteRole('myRole');
  console.log(response);
  /*
  { found: true,
    _index: '%kuzzle',
    _type; 'roles',
    _id: 'myRole',,
    _version: 2,
    result: 'deleted',
    _shards: {  total: 2, successful: 1, failed: 0 } }
   */

  console.log('Role successfully deleted');
} catch (e) {
  console.error(e);
}
