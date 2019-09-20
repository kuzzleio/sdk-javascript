try {
  // Prints: [ 1542890183, 868983 ]
  // ...but only if the current time on your server is:
  //    [GMT] Nov. 22, 2018 12:36:23 PM
  console.log(await kuzzle.ms.time());
} catch (error) {
  console.error(error.message);
}
