try {
  const specifications = await kuzzle.collection.getSpecifications('nyc-open-data', 'yellow-taxi');
  console.log(specifications);
  /*
    {
      "collection": "yellow-taxi",
      "index": "nyc-open-data",
      "validation": {
        "fields": {
          "age": {
            "defaultValue": 42,
            "mandatory": true,
            "type": "integer"
          }
        },
        "strict": true
      }
    }
  */
  console.log('Success');
} catch (error) {
  console.error(error.message);
}
