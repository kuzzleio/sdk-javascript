// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .scrollSpecifications(scrollId, {scroll: '1m'}, function (err, res) {
    res.hits.forEach(function (specification) {
      console.log(specification);      
    });
    
    res.total // Total specifications count
  });

// Using promises (NodeJS only)
kuzzle
  .collection('collection', 'index')
  .scrollSpecificationsPromise(scrollId, {scroll: '1m'})
  .then(res => {
    res.hits.forEach(specification => {
      console.log(specification);
    });
    
    res.total // Total specifications count
  });
