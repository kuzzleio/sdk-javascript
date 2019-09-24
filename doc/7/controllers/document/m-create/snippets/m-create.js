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
        "_version": 1,
        "result": "created",
        "created": true,
        "status": 200,
        "_source": {
          "_kuzzle_info": {
            "author": "-1",
            "updater": null,
            "updatedAt": null,
            "createdAt": 1542036563677
          },
          "capacity": 4
        }
      },
      {
        "_id": "AWcIiqbeBiYFF8kkRLKg",
        "_version": 1,
        "result": "created",
        "created": true,
        "status": 200,
        "_source": {
          "_kuzzle_info": {
            "author": "-1",
            "updater": null,
            "updatedAt": null,
            "createdAt": 1542036563677
          },
          "this": "document id is auto-computed"
        }
      }
    ],
    "errors": []
  }
  */
  console.log(`Successfully created ${response.hits.length} documents`);
} catch (error) {
  console.error(error.message);
}