const request = {
  controller: 'document',
  action: 'create',
  index: 'nyc-open-data',
  collection: 'yellow-taxi',
  _id: 'my-custom-document-id',
  refresh: 'wait_for', // Additional property allowed for this API action
  body: {
    trip_distance: 4.23,
    passenger_count: 2
  }
};

try {
  const response = await kuzzle.query(request);
  console.log(response);
  /*
    { requestId: '49ffb6db-bdff-45b9-b3f6-00442f472393',
      status: 200,
      error: null,
      controller: 'document',
      action: 'create',
      collection: 'yellow-taxi',
      index: 'nyc-open-data',
      volatile: { sdkVersion: '6.0.0-beta-2' },
      room: '49ffb6db-bdff-45b9-b3f6-00442f472393',
      result:
       { _index: 'nyc-open-data',
         _type: 'yellow-taxi',
         _id: 'my-custom-document-id',
         _version: 1,
         result: 'created',
         _shards: { total: 2, successful: 1, failed: 0 },
         created: true,
         _source:
          { trip_distance: 4.23,
            passenger_count: 2,
            _kuzzle_info:
             { author: '-1',
               createdAt: 1532529302225,
               updatedAt: null,
               updater: null,
               active: true,
               deletedAt: null } } } }
  */

  console.log('Document created');
} catch (error) {
  console.error(error);
}
