try {
  const result = await kuzzle.bulk.updateByQuery(
    'nyc-open-data',
    'yellow-taxi',
    {
      match: {
        capacity: 4
      }
    }, 
    { capacity: 42 });
  console.log(result);
  /**
   * 2
   */
} catch (error) {
  console.log(error.message);
}
