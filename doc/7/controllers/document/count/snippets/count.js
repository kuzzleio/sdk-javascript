try {
  const count = await kuzzle.document.count(
    'nyc-open-data',
    'yellow-taxi',
    {
      query: {
        match: { license: 'valid' }
      }
    }
  );

  console.log(`Found ${count} documents matching license:valid`);
} catch (error) {
  console.error(error.message);
}
