const suv = { category: 'suv' };
const limousine = { category: 'limousine' };

try {
  const requests = [];

  for (let i = 0; i < 5; i++) {
    requests.push(kuzzle.document.create('nyc-open-data', 'yellow-taxi', suv));
  }
  for (let i = 0; i < 10; i++) {
    requests.push(kuzzle.document.create('nyc-open-data', 'yellow-taxi', limousine));
  }
  await Promise.all(requests);

  await kuzzle.index.refresh('nyc-open-data');

  const results = await kuzzle.document.search(
    'nyc-open-data',
    'yellow-taxi',
    {
      query: {
        match: {
          category: 'suv'
        }
      }
    }
  );

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
    "total": 5,
    "fetched": 5,
    "scroll_id": undefined
  */
  console.log(`Successfully retrieved ${results.total} documents`);
} catch (error) {
  console.error(error.message);
}
