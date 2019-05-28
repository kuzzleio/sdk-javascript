const suv = { category: 'suv' };

try {
  const requests = [];

  for (let i = 0; i < 10; i++) {
    requests.push(kuzzle.document.create('nyc-open-data', 'yellow-taxi', suv));
  }

  await Promise.all(requests);

  // Waits documents to be indexed
  await kuzzle.index.refresh('nyc-open-data');

  const searchOptions = {
    scroll: '1m',
    size: 5
  };

  let results = await kuzzle.document.search(
    'nyc-open-data',
    'yellow-taxi',
    {
      query: {
        match: {
          category: 'suv'
        }
      }
    },
    searchOptions
  );

  // Fetch the next fetch results and push them into the 'documents' array
  const documents = [];

  while (results) {
    results.hits.forEach(hit => documents.push(hit._source));
    results = await results.next();
  }

  console.log(results);
  /*
    {
      "aggregations": undefined,
      "hits": [
        {
          "_index": "nyc-open-data",
          "_type": "yellow-taxi",
          "_id": "AWgi6A1POQUM6ucJ3q06",
          "_score": 0.046520017,
          "_source": {
            "category": "suv",
            "_kuzzle_info": {
              "author": "-1",
              "createdAt": 1546773859655,
              "updatedAt": null,
              "updater": null,
              "active": true,
              "deletedAt": null
            }
          }
        },
        ...
      ]
    },
    "total": 10,
    "fetched": 10,
    "scroll_id": "DnF1ZXJ5VGhlbkZldGNoBQAAAAAAAAAqFnQ5NU9sZWFaUTRhd2VHNU5KZzVEQ"
  */

  console.log(`Successfully retrieved ${documents.length} documents`);
} catch (error) {
  console.error(error.message);
}
