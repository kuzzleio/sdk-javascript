kuzzle.index.create('nyc-open-data')
  .then(() => 'do something')
  .catch(error => {
    if (error.status === 412) {
      console.log(error.message);
      console.log('Try with another name!');
    }
  });
