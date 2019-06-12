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
  .validateSpecifications(specifications, function (err, isValid) {
    // isValid is a boolean
  });

// Using promises (NodeJS)
kuzzle
  .collection('collection', 'index')
  .validateSpecificationsPromise(specifications)
  .then(isValid => {
    // isValid is a boolean
  });
