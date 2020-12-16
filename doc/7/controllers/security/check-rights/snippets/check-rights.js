const body = {
  controller: 'document',
  action: 'create',
  index: 'nyc-open-data',
  collection: 'yellow-taxi',
  body: {
    'name': 'Melis'
  }
}

try {
  const result = await kuzzle.security.checkRights('foo', body);
  console.log(result.allowed);
  /*
    true
  */
} catch (error) {
  console.error(error.message);
}