try {
  const success = await kuzzle.index.refreshInternal();

  if (success) {
    console.log('Internal index successfully refreshed');
  }
} catch (error) {
  console.error(error.message);
}
