const {
  Kuzzle,
  Http
} = require('kuzzle-sdk');

const kuzzle = new Kuzzle(
  new Http('kuzzle')
);


kuzzle.on('networkError', error => {
  console.error('Network Error:', error);
});

(async () => {
  try {
    await kuzzle.connect();
    console.log('connected')
    setTimeout(async () => {
      console.log('go')
      try {
        await kuzzle.document.create('index', 'collection', { foo: 'bar' }, 42)
      } catch (error) {
        console.error(error)
      }
    }, 7000);
  } catch (error) {
    console.error(error)
  }
})()
