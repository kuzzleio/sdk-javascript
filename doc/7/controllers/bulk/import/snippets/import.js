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
    { errors: [],
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
  console.log(`Successfully imported ${response.successes.length} documents`);
} catch (error) {
  console.error(error.message);
}
