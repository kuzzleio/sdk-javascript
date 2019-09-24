const bulkData = [
  { index: { } },
  { a: 'document', with: 'any', number: 'of fields' },

  { create: { _id: 'uniq-id-2' } },
  { another: 'document' },

  { create: { _id: 'uniq-id-3' } },
  { and: { another: 'one' } }
];

try {
  const response = await kuzzle.bulk.import('nyc-open-data', 'yellow-taxi', bulkData);
  console.log(response);
  /*
    { errors: false,
      successes:
      [ {
          index: {
            _id: "hQ10_GwBB2Y5786Pu_NO",
            status: 201
          }
        },
        {
          create: {
            _id: "uniq-id-2",
            status: 201
          }
        },
        {
          create: {
            _id: "uniq-id-3",
            status: 201
          }
        } ] }
  */
  const successfulImport = response.successes.filter(item => {
    return Object.values(item)[0].status < 400;
  });

  console.log(`Successfully imported ${successfulImport.length} documents`);
} catch (error) {
  console.error(error.message);
}
