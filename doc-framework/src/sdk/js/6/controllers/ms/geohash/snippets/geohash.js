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

  // Prints: [ 'spfb0frz6x0', 'spfb09jv9n0' ]
  console.log(await kuzzle.ms.geohash('geofoo', ['HQ', 'other HQ']));
} catch (error) {
  console.error(error.message);
}
