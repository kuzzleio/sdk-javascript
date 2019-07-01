try {
  const allStats = await kuzzle.server.getAllStats();

  console.log('All Kuzzle Stats:', JSON.stringify(allStats));
} catch (error) {
  console.error(error.message);
}
