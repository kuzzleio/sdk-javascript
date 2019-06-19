const
  body = {
    query: {
      bool: {
        must: [
          {
            terms: {status: ['idle', 'wantToHire', 'toHire', 'riding']}
          },
          {
            term: {type: 'cab'}
          },
          {
            geo_distance: {
              distance: '10km',
              pos: {lat: '48.8566140', lon: '2.352222'}
            }
          }
        ]
      }
    },
    sort: [
      'status',
      {
        _geo_distance : {
          pos: {lat: '48.8566140', lon: '2.352222'},
          order : "asc"
        }
      },
      {date: "desc"}
    ],
    aggregations: {
      aggs_name: {
        terms: {
          field: "field_name"
        }
      }
    }
  },
  options = {
    from: 0,
    size: 20
  };

// Using callbacks (NodeJS or Web Browser)
kuzzle
  .collection('collection', 'index')
  .search(body, options, function (err, searchResult) {
    searchResult.getDocuments().forEach(function(document) {
      console.log(document.toString());
    });
  });

// Using promises (NodeJS only)
kuzzle
  .collection('collection', 'index')
  .searchPromise(body, options)
  .then(searchResult => {
    searchResult.getDocuments().forEach(document => {
      console.log(document.toString());
    });
  });
