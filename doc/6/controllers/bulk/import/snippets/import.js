const bulkData = [
  { create: { _id: '1', _index: 'nyc-open-data', _type: 'yellow-taxi' } },
  { a: 'document', with: 'any', number: 'of fields' },
  { create: { _id: '2', _index: 'nyc-open-data', _type: 'yellow-taxi' } },
  { another: 'document' },
  { create: { _id: '3', _index: 'nyc-open-data', _type: 'yellow-taxi' } },
  { and: { another: 'one' } }
];

try {
  const response = await kuzzle.bulk.import(bulkData);
  console.log(response);
  /*
    { errors: false,
      items:
      [ {
          create: {
            _id: "uniq-id-1",
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
            status: 206
          }
        } ] }
  */
  const successfulImport = response.items.filter(item => item.create.status === 201);

  console.log(`Successfully imported ${successfulImport.length} documents`);
} catch (error) {
  console.error(error.message);
}
