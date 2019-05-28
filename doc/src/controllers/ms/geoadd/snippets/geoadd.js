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
  const result = await kuzzle.ms.geoadd('geofoo', [kuzzleHQ, otherHQ]);

  // Prints: 2
  console.log(result);
} catch (error) {
  console.error(error.message);
}
