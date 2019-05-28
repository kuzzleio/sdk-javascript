try {
  await kuzzle.ms.set('val', 43);

  // Prints: 42
  console.log(await kuzzle.ms.decr('val'));
} catch (error) {
  console.error(error.message);
}
