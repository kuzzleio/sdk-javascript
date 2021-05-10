try {
  const response = await kuzzle.document.deleteFields('nyc-open-data', 'yellow-taxi', 'some-id', ['bar'], {source: true});

  console.log(response._source);
} catch (error) {
  console.error(error.message);
}