var specifications = {
  strict: 'true',
  fields: {
    foo: {
      mandatory: true,
      type: 'string',
      defaultValue: 'bar'
    }
  }
};

// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .updateSpecifications(specifications, function (err, res) {
    // result is a JSON object
  });

// Using promises (NodeJS)
kuzzle
  .collection('collection', 'index')
  .updateSpecificationsPromise(specifications)
  .then(res => {
    // result is a JSON object
  });
