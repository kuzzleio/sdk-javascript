try {
  result = await kuzzle.document.updateByQuery(
    'nyc-open-data',
    'yellow-taxi',
    {
      equals: {
        capacity: 4
      }
    },
    {
      capacity: 42
    },
    {
      lang: 'koncorde'
    });
/*
{
successes: [
  {
    _id: <document-id>,
    _source: <updated document> // if source set to true
    status: 200
  },
  {
    _id: <document id>,
    _source: <updated document> // if source set to true
    status: 200
  }
],
errors: []
}
*/
} catch (error) {
  console.log(error.message);
}
