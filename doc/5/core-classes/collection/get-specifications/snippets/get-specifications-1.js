// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .getSpecifications(function (error, specifications) {
    // specifications is a JSON object
  });

// Using promises (NodeJS)
kuzzle
  .collection('collection', 'index')
  .getSpecificationsPromise()
  .then(specifications => {
    // specifications is a JSON object
  });
