try {
  // Prints: PONG
  console.log(await kuzzle.ms.ping());
} catch (error) {
  console.error(error.message);
}
