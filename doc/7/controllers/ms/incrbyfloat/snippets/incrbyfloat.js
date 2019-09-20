try {
  await kuzzle.ms.set('almost pi', 3);

  // Prints: 3.14159
  console.log(await kuzzle.ms.incrbyfloat('almost pi', 0.14159));
} catch (error) {
  console.error(error.message);
}
