try {
  const documents = [
    {
      _id: 'some-id',
      body: { 'capacity': 4 }
    },
    {
      _id: 'some-other-id',
      body: { 'capacity': 4 }
    }
  ];

  const response = await kuzzle.document.mCreateOrReplace(
    'nyc-open-data',
    'yellow-taxi',
    documents
  );

  console.log(JSON.stringify(response));
  /*
    {
      "hits": [
        {
          "_id": "some-id",
          "_source": {
            "_kuzzle_info": {
              "active": true,
              "author": "-1",
              "updater": null,
              "updatedAt": null,
              "deletedAt": null,
              "createdAt": 1542036740596
            },
            "capacity": 4
          },
          "_index": "nyc-open-data",
          "_type": "yellow-taxi",
          "_version": 1,
          "result": "created",
          "_shards": {
            "total": 2,
            "successful": 1,
            "failed": 0
          },
          "created": true,
          "status": 201
        },
        {
          "_id": "some-other-id",
          "_source": {
            "_kuzzle_info": {
              "active": true,
              "author": "-1",
              "updater": null,
              "updatedAt": null,
              "deletedAt": null,
              "createdAt": 1542036740596
            },
            "capacity": 4
          },
          "_index": "nyc-open-data",
          "_type": "yellow-taxi",
          "_version": 1,
          "result": "created",
          "_shards": {
            "total": 2,
            "successful": 1,
            "failed": 0
          },
          "created": true,
          "status": 201
        }
      ],
      "total": 2
    }
  */
  console.log(`Successfully createOrReplace ${response.total} documents`);
} catch (error) {
  console.error(error.message);
}