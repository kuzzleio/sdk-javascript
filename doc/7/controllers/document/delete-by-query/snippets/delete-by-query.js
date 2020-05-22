try {
  const deleted = await kuzzle.document.deleteByQuery(
    'nyc-open-data',
    'yellow-taxi',
    {
      query: {
        term: { capacity: 7 }
      }
    },
    {refresh: 'wait_for'}
  );

  console.log(`Successfully deleted ${deleted.length} documents`);
} catch (error) {
  console.error(error.message);
}