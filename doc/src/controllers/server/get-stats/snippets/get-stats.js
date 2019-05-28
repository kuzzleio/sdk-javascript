try {
  const stats = await kuzzle.server.getStats('1234567890101', '1541426610304');

  console.log('Kuzzle Stats:', JSON.stringify(stats));
} catch (error) {
  console.error(error.message);
}
