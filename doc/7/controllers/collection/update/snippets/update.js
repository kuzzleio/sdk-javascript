const mapping = {
  dynamic: 'false',
  _meta: {
    area: 'Panipokhari'
  },
  properties: {
    plate: { type: 'keyword' }
  }
};

try {
  await kuzzle.collection.update('nyc-open-data', 'yellow-taxi', mapping);

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
