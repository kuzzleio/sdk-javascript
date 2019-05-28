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
      [ { create: create: {
        _id: "1",
        status: 200 } },
        { create: create: {
        _id: "2",
        status: 200 } },
        { create: create: {
        _id: "3",
        status: 200 } } ] }
  */

  console.log(`Successfully imported ${response.length} documents`);
} catch (error) {
  console.error(error.message);
}
