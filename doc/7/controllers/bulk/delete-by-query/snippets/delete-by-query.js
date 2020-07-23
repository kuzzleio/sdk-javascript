try {
  const deleted = await kuzzle.bulk.deleteByQuery(
    'nyc-open-data',
    'yellow-taxi',
    {
      query: {
        term: { capacity: 7 }
      }
    }
  );

  console.log(`Successfully deleted ${deleted} documents`);
} catch (error) {
  console.error(error.message);
}