try {
  const config = await kuzzle.server.getConfig();

  console.log('Kuzzle Server configuration:', JSON.stringify(config));
} catch (error) {
  console.error(error.message);
}
