await kuzzle.connect();

kuzzle.registerPipe('kuzzle:query:before', 'log server:now', request => {
  if (request.controller !== 'server' || request.action !== 'now') {
    return;
  }

  console.log('Execute server:now');

  return request;
});

kuzzle.registerPipe('kuzzle:query:after', 'parse server:now', response => {
  if (response.controller !== 'server' || response.action !== 'now') {
    return;
  }

  response.result.parsed = new Date(response.result.now);

  return response;
});

const result = await kuzzle.server.now();

console.log(`Parsed date: ${result.parsed}`);