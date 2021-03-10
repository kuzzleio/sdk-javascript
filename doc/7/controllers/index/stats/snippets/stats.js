const stats = await kuzzle.index.stats();

console.log(JSON.stringify(stats));
