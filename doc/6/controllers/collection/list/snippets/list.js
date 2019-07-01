try {
  const options = { from: 1, size: 1 };

  const collectionList = await kuzzle.collection.list('mtp-open-data', options);
  console.log(collectionList);
  /*
    {
      type: 'all',
      collections: [ { name: 'pink-taxi', type: 'stored' } ],
      from: 1,
      size: 1
    }
  */

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
