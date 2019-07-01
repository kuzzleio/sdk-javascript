try {
  const timestamp = await kuzzle.server.now();

  console.log('Epoch-millis timestamp:', timestamp);
} catch (error) {
  console.error(error.message);
}
