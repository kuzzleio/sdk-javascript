const request = {
  controller: 'auth',
  action: 'checkRights',
  request: {
    controller: 'document',
    action: 'create',
    index: 'nyc-open-data',
    collection: 'yellow-taxi',
    body: {
      'name': 'Melis'
    }
  }
}

try {
  const result = await kuzzle.security.checkRights('foo', request);
  console.log(result.allowed);
  /*
    true
  */
} catch (error) {
  console.error(error.message);
}
