await kuzzle.connect();

kuzzle.registerPipe('kuzzle:query:before', 'log server:now', request => {
  if (request.controller !== 'server' || request.action !== 'now') {
    return;
  }

  console.log('Execute server:now');

  return request;
});

await kuzzle.server.now();
