const bulkData = [
  { create: { _id: '1' } },
  { a: 'document', with: 'any', number: 'of fields' },
  { create: { _id: '2' } },
  { another: 'document' },
  { create: { _id: '3' } },
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
            status: 200
          }
        },
        {
          create: {
            _id: "uniq-id-2",
            status: 200
          }
        },
        {
          create: {
            _id: "uniq-id-3",
            status: 200
          }
        } ] }
  */
  const successfulImport = response.items.filter(item => item.create.status === 200);

  console.log(`Successfully imported ${successfulImport.length} documents`);
} catch (error) {
  console.error(error.message);
}
