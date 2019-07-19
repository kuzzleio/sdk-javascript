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

  // Prints:
  // [
  //   [ 3.910904824733734, 43.607392252329916 ],
  //   [ 3.8971075415611267, 43.600221526170145 ]
  // ]
  console.log(await kuzzle.ms.geopos('geofoo', ['HQ', 'other HQ']));
} catch (error) {
  console.error(error.message);
}
