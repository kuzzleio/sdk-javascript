// Deleting specifications using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .deleteSpecifications(function (err, res) {
    // callback called once the delete action has been completed
  });

// Deleting specifications using promises (NodeJS)
kuzzle
  .collection('collection', 'index')
  .deleteSpecificationsPromise()
  .then(res => {
    // promises resolved once the delete action has been completed
  });
