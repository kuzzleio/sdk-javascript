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

  console.log(response);
  /*
    {
      "hits": [
        {
          "_id": "some-id",
          "_version": 1,
          "created": true,
          "status": 200,
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
          }
        },
        {
          "_id": "some-other-id",
          "_version": 1,
          "created": true,
          "status": 200,
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
          }
        }
      ],
      "errors": []
    }
  */
  console.log(`Successfully createOrReplace ${response.total} documents`);
} catch (error) {
  console.error(error.message);
}