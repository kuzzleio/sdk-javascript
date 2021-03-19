const stats = await kuzzle.index.stats();

console.log(JSON.stringify(stats));
/*
  {
    "indexes":[
      {
        "name":"nyc-open-data",
        "size":42,
        "collections":[
          {
            "name":"yellow-taxi",
            "documentCount":42,
            "size":42
          }
        ]
      }
    ],
    "size":42
  }
*/
