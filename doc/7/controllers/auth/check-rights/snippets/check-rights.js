const requestPayload = {
  controller: 'document',
  action: 'create',
  index: 'nyc-open-data',
  collection: 'yellow-taxi',
  body: {
    name: 'Melis'
  }
}

try {
  const result = await kuzzle.auth.checkRights(requestPayload);
  console.log(result);
  /*
    true
  */
} catch (error) {
  console.error(error.message);
}
