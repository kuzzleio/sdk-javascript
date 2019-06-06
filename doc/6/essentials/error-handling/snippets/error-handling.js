kuzzle.index.create('nyc-open-data')
  .then(() => 'do something')
  .catch(error => {
    if (error.status === 400) {
      console.log(error.message);
      console.log('Try with another name!');
    }
  });
