// Optional: a mapping can be provided and will be
// applied when the collection is created
const mapping = {
  properties: {
    field1: {
      type: '<es field type>'
    },
    field2: {
      type: '<es field type>'
    }
  }
};

// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .create(mapping, function (error, result) {
    // callback called once the create operation has completed
    // => the result is a JSON object containing the raw Kuzzle response:
    // {
    //    acknowledged: true
    // }
  });

// Using promises (NodeJS only)
kuzzle
 .collection('collection', 'index')
 .createPromise(mapping)
 .then(result => {
    // promise resolved once the create operation has completed
    // => the result is a JSON object containing the raw Kuzzle response:
    // {
    //    acknowledged: true
    // }
 });
