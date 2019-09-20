try {
  const valid = await kuzzle.document.validate(
    'nyc-open-data',
    'yellow-taxi',
    { capacity: 4 }
  );

  if (valid) {
    console.log('Success');
  }
} catch (error) {
  console.error(error.message);
}