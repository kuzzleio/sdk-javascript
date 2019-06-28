// Using callbacks (node.js or browser)
kuzzle.getAutoRefresh('myIndex', function (err, autoRefresh) {
  console.log(autoRefresh);     // true|false
});

// Using promises (node.js)
kuzzle
  .getAutoRefreshPromise('myIndex')
  .then(autoRefresh => {
    console.log(autoRefresh);   // true|false
  });
