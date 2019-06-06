try {
  const body = {
    query: {
      match_all: {
        boost: 1
      }
    }
  };

  const options = {
    size: 50,
    offset: 0,
    scroll: '10m'
  };

  const searchResult = await kuzzle.collection.searchSpecifications(body, options);
  console.log(searchResult);
  /*
    {
      "total": 1,
      "max_score": 1,
      "hits": [
        {
          "_index": "%kuzzle",
          "_type": "validations",
          "_id": "nyc-open-data#yellow-taxi",
          "_score": 1,
          "_source": {
            "validation": {
              "strict": false,
              "fields": {
                "license": {
                  "type": "string"
                }
              }
            },
            "index": "nyc-open-data",
            "collection": "yellow-taxi"
          }
        }
      ],
      "scrollId": "DnF1ZXJ5VGhlbkZldGNoBQAAAAAAAACSFlgtZTJFYjNiU1FxQzhSNUFpNlZHZGcAAAAAAAAAkxZYLWUyRWIzYlNRcUM4UjVBaTZWR2RnAAAAAAAAAJQWWC1lMkViM2JTUXFDOFI1QWk2VkdkZwAAAAAAAACVFlgtZTJFYjNiU1FxQzhSNUFpNlZHZGcAAAAAAAAAlhZYLWUyRWIzYlNRcUM4UjVBaTZWR2Rn"
    }
  */
} catch (error) {
  console.error(error.message);
}
