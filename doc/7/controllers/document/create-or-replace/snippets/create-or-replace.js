try {
  const response = await kuzzle.document.createOrReplace(
    'nyc-open-data',
    'yellow-taxi',
    'some-id',
    { lastName: 'McHan' }
  );

  console.log(response);
  /*
    response =
    { _id: 'some-id',
      _version: 1,
      created: true,
      _source:
       { lastName: 'McHan',
         _kuzzle_info:
          { author: '-1',
            createdAt: 1537443212089,
            updatedAt: null,
            updater: null } } }
   */
} catch (error) {
  console.error(error.message);
}
