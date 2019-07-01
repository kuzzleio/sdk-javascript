try {
  await kuzzle.ms.set('foo', 'bar');

  // Prints: 1
  console.log(await kuzzle.ms.exists(['foo']));

  // Oct. 12, 2011
  await kuzzle.ms.pexpireat('foo', 1318425955000);

  // Prints: 0
  console.log(await kuzzle.ms.exists(['foo']));
} catch (error) {
  console.error(error.message);
}
