try {
  const response = await kuzzle.security.deleteProfile('myProfile');
  console.log(response);
  /*
  { found: true,
    _index: '%kuzzle',
    _type: 'profiles',
    _id: 'myProfile',
    _version: 29,
    result: 'deleted',
    _shards: { total: 2, successful: 1, failed: 0 } }
   */

  console.log('Profile successfully deleted');
} catch (e) {
  console.error(e);
}
