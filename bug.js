const Kuzzle  = require('./index').Kuzzle;


const kuzzle = new Kuzzle('websocket', {host: 'localhost'});

async function run() {
 await kuzzle.connect();
 const roomID = await kuzzle.realtime.subscribe('obix', 'firmwares', {}, (r) => {
   console.log(r);
 })

 await kuzzle.realtime.publish('obix', 'firmware', {msg: 'hello world'})
}

run()
