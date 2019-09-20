const specifications = {
  strict: false,
  fields: {
    license: {
      mandatory: true,
      type: 'string'
    }
  }
};

try {
  const result = await kuzzle.collection.updateSpecifications('nyc-open-data', 'yellow-taxi', specifications);
  console.log(result);
  /*
    { strict: false,
      fields: {
        license: {
          mandatory: true,
          type: 'string' } } }
  */

  console.log('Success');
} catch (error) {
  console.error(error.message);
}
