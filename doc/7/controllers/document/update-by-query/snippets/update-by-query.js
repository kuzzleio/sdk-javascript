try {
  result = await kuzzle.document.updateByQuery(
    'nyc-open-data',
    'yellow-taxi',
    {
      query: {
        match: {
          capacity: 4
        }
      }
    }, {
      changes: {
        capacity: 42
      }
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
