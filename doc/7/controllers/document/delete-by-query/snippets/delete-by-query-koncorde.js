try {
  const deleted = await kuzzle.document.deleteByQuery(
    'nyc-open-data',
    'yellow-taxi', {
      query: {
        equals: { capacity: 7 }
      }
    }, { lang: 'koncorde' }
  );

  console.log(`Successfully deleted ${deleted.length} documents`);
} catch (error) {
  console.error(error.message);
}
