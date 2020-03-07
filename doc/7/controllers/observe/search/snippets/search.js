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

  await kuzzle.collection.refresh('nyc-open-data', 'yellow-taxi');


  const results = await kuzzle.observe.search(
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
    ObserverSearchResult {
      hits: [
        Observer {
          _listening: true,
          _index: 'index',
          _collection: 'collection',
          _id: 'bdOvsHABsmbcYFSXBWXK',
          _source: {
            "category": "suv",
            "_kuzzle_info": {
              "author": "-1",
              "createdAt": 1546773859654,
              "updatedAt": null,
              "updater": null
            }
          }
        },
        Observer {
          _listening: true,
          _index: 'index',
          _collection: 'collection',
          _id: 'btOvsHABsmbcYFSXE2Vv',
          _source: {
            "category": "suv",
            "_kuzzle_info": {
              "author": "-1",
              "createdAt": 1546773859655,
              "updatedAt": null,
              "updater": null
            }
          }
        },
        ...
      ],
      fetched: 5,
      total: 5
    }
  */
} catch (error) {
  console.error(error.message);
}
