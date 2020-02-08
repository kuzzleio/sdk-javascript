await kuzzle.connect();

kuzzle.registerPipe('kuzzle:query:before', request => {
  if (request.controller !== 'server' || request.action === 'now') {
    return;
  }

  console.log('Execute server:now');
});

kuzzle.registerPipe('kuzzle:query:after', response => {
  if (response.controller !== 'server' || response.action === 'now') {
    return;
  }

  response.result.parsed = new Date(response.result.now);
});


const result = await kuzzle.server.now();

console.log(`Parsed date: ${result.parsed}`);