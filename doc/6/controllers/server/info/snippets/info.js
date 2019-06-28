try {
  const serverInfo = await kuzzle.server.info();

  console.log('Kuzzle Server information:', JSON.stringify(serverInfo));
} catch (error) {
  console.error(error.message);
}
