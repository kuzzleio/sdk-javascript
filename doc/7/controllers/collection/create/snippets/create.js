const mappings = {
  properties: {
    license: { type: 'keyword' },
    driver: {
      properties: {
        name: { type: 'keyword' },
        curriculum: { type: 'text' }
      }
    }
  }
};

try {
  await kuzzle.collection.create('nyc-open-data', 'yellow-taxi', { mappings });

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
