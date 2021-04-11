try {
  await kuzzle.document.create(
    'nyc-open-data',
    'yellow-taxi',
    { capacity: 4 },
    'some-id'
  );

  const observer = await kuzzle.observer.get(
    'nyc-open-data',
    'yellow-taxi',
    'some-id',
    { reference: 'page-A' });

  console.log(observer);
  /*
    Observer {
      _id: 'barfoo',
      _source: { name: 'Aschen', _kuzzle_info: [Object] },
      _score: 1,
      notifyOnly: false,
      enabled: true
    }
  */

  await kuzzle.observer.cleanObservers('page-A');

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
