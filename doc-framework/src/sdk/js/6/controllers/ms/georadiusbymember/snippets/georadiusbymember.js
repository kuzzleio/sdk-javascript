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
  console.log(await kuzzle.ms.georadiusbymember(
    'geofoo',
    'HQ',
    1500,
    'm'
  ));

  // Prints:
  // [
  //   { name: 'other HQ', distance: 1367.8521 },
  //   { name: 'HQ', distance: 0 }
  // ]
  console.log(await kuzzle.ms.georadiusbymember(
    'geofoo',
    'HQ',
    1500,
    'm',
    {withdist: true, sort: 'desc'}
  ));

  // Prints:
  // [
  //   {
  //     name: 'HQ',
  //     distance: 0,
  //     coordinates: [ 3.910904824733734, 43.607392252329916 ]
  //   },
  //   {
  //     name: 'other HQ',
  //     distance: 1367.8521,
  //     coordinates: [ 3.8971075415611267, 43.600221526170145 ]
  //   }
  // ]
  console.log(await kuzzle.ms.georadiusbymember(
    'geofoo',
    'HQ',
    1500,
    'm',
    {withcoord: true, withdist: true, sort: 'asc'}
  ));
} catch (error) {
  console.error(error.message);
}
