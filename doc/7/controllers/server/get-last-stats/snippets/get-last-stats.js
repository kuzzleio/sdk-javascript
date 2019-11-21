try {
  const lastStat = await kuzzle.server.getLastStats();

  console.log('Last Kuzzle Stats:', JSON.stringify(lastStat));
} catch (error) {
  console.error(error.message);
}
