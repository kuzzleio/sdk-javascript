try {
  const mapping = await kuzzle.collection.getMapping('nyc-open-data', 'yellow-taxi');

  console.log(mapping);
  /*
  {
    dynamic: 'true',
    _meta: {
      area: 'Panipokhari
    },
    properties: {
      license: { type: 'keyword' },
      driver: {
        properties: {
          name: { type: 'keyword' },
          curriculum: { type: 'text' }
        }
      }
    }
  }
  */

  console.log(mapping.dynamic); // true
} catch (error) {
  console.error(error.message);
}
