try {
  const response = await kuzzle.document.create(
    'nyc-open-data',
    'yellow-taxi',
    { lastName: 'Eggins' },
    'some-id'
  );

  if (response._id === 'some-id') {
    console.log('Success');
  }
  /*
    response =
    { _id: 'some-id',
      _version: 1,
      _source:
       { lastName: 'Eggins',
         _kuzzle_info:
          { author: '-1',
            createdAt: 1537443212089,
            updatedAt: null,
            updater: null,
            active: true,
            deletedAt: null } } }
   */
} catch (error) {
  console.error(error.message);
}
