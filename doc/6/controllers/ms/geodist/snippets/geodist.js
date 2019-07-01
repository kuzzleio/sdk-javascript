const kuzzleHQ = {
  lon: 3.9109057,
  lat: 43.6073913,
  name: 'HQ'
};

const otherHQ = {
  lon: 3.897105,
  lat: 43.6002203,
  name: 'other HQ'
};

try {
  await kuzzle.ms.geoadd('geofoo', [kuzzleHQ, otherHQ]);

  // Prints: 1367.8521
  console.log(await kuzzle.ms.geodist('geofoo', 'HQ', 'other HQ'));

  // Prints: 4487.7038
  console.log(await kuzzle.ms.geodist(
    'geofoo',
    'HQ',
    'other HQ',
    {unit: 'ft'}
  ));
} catch (error) {
  console.error(error.message);
}
