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

  // Prints: [ { name: 'other HQ' }, { name: 'HQ' } ]
  console.log(await kuzzle.ms.georadius(
    'geofoo',
    3.948711,
    43.5764455,
    20,
    'km'
  ));

  // Prints:
  // [
  //   { name: 'other HQ', distance: 4.9271 },
  //   { name: 'HQ', distance: 4.596 }
  // ]
  console.log(await kuzzle.ms.georadius(
    'geofoo',
    3.948711,
    43.5764455,
    20,
    'km',
    {withdist: true, sort: 'desc'}
  ));

  // Prints:
  // [
  //   {
  //     name: 'HQ',
  //     distance: 4.596,
  //     coordinates: [ 3.910904824733734, 43.607392252329916 ]
  //   },
  //   {
  //     name: 'other HQ',
  //     distance: 4.9271,
  //     coordinates: [ 3.8971075415611267, 43.600221526170145 ]
  //   }
  // ]
  console.log(await kuzzle.ms.georadius(
    'geofoo',
    3.948711,
    43.5764455,
    20,
    'km',
    {withcoord: true, withdist: true, sort: 'asc'}
  ));
} catch (error) {
  console.error(error.message);
}
