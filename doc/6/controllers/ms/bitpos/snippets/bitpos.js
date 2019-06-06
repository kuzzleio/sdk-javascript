try {
  await kuzzle.ms.set('key', '\x00\x00\x01');

  // Prints: 23
  console.log(await kuzzle.ms.bitpos('key', 1));
} catch (error) {
  console.error(error.message);
}
