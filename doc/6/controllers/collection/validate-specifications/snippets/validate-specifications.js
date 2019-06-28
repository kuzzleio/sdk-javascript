try {
  const specifications = {
    strict: false,
    fields: {
      license: {
        mandatory: true,
        type: 'symbol' // symbol is not a recognized type
      }
    }
  };

  const result = await kuzzle.collection.validateSpecifications('nyc-open-data', 'yellow-taxi', specifications);
  console.log(result);
  /*
    {
      valid: false,
      details: [
        'In nyc-open-data.yellow-taxi.license: symbol is not a recognized type.'
      ],
      description: 'Some errors with provided specifications.'
    }
  */

  if (result.valid === false) {
    console.log(result.description);
  }
} catch (error) {
  console.error(error.message);
}
