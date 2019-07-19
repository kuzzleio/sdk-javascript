try {
  const documents = [
    {
      _id: 'some-id',
      body: { 'capacity': 4 }
    },
    {
      body: { this: 'document id is auto-computed' }
    }
  ];
  const response = await kuzzle.document.mCreate(
    'nyc-open-data',
    'yellow-taxi',
    documents
  );

  console.log(response);
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
            "createdAt": 1542036563677
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
        "_id": "AWcIiqbeBiYFF8kkRLKg",
        "_source": {
          "_kuzzle_info": {
            "active": true,
            "author": "-1",
            "updater": null,
            "updatedAt": null,
            "deletedAt": null,
            "createdAt": 1542036563677
          },
          "this": "document id is auto-computed"
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
  console.log(`Successfully created ${response.total} documents`);
} catch (error) {
  console.error(error.message);
}