const
  filters = {
    match_all: {
      boost: 1
    }
  },
  options= {
    from: 0,
    size: 20
  };

// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .searchSpecifications(filters, options, function (err, res) {
    res.hits.forEach(function (specification) {
      console.log(specification);
    });
    
    res.total // Total specifications count
  });

// Using promises (NodeJS only)
kuzzle
  .collection('collection', 'index')
  .searchSpecificationsPromise(filters, options)
  .then(res => {
    res.hits.forEach(specification => {
      console.log(specification);
    });
    
    res.total // Total specifications count
  });
