const doc1 = { capacity: 4 };
const doc2 = { capacity: 7 };

try {
  await kuzzle.document.create('nyc-open-data', 'yellow-taxi', doc1, 'some-id');
  await kuzzle.document.create('nyc-open-data', 'yellow-taxi', doc2, 'some-other-id');

  const response = await kuzzle.document.mGet(
    'nyc-open-data',
    'yellow-taxi',
    ['some-id', 'some-other-id']
  );

  console.log(response);
  /*
    {
      "hits": [
        {
          "_index": "nyc-open-data",
          "_type": "yellow-taxi",
          "_id": "some-id",
          "_version": 1,
          "found": true,
          "_source": {
            "capacity": 4,
            "_kuzzle_info": {
              "author": "-1",
              "createdAt": 1542036871353,
              "updatedAt": null,
              "updater": null,
              "active": true,
              "deletedAt": null
            }
          }
        },
        {
          "_index": "nyc-open-data",
          "_type": "yellow-taxi",
          "_id": "some-other-id",
          "_version": 1,
          "found": true,
          "_source": {
            "capacity": 7,
            "_kuzzle_info": {
              "author": "-1",
              "createdAt": 1542036871374,
              "updatedAt": null,
              "updater": null,
              "active": true,
              "deletedAt": null
            }
          }
        }
      ],
      "total": 2
    }
  */
  console.log(`Successfully get ${response.total} documents`);
} catch (error) {
  console.error(error.message);
}
