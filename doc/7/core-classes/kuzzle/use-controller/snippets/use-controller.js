class TaxiController extends BaseController {
  constructor (kuzzle) {
    super(kuzzle, 'my-plugin/taxi');
  }

  enroll () {
    return this.query({
      action: 'enroll'
    });
  }
}

const kuzzle = new Kuzzle(
  new WebSocket('kuzzle')
);

// Add the custom SDK controller
kuzzle.useController(TaxiController, 'taxi');

const run = async () => {
  try {
    await kuzzle.connect();

    // Call the custom SDK controller action
    console.log(await kuzzle.taxi.enroll());

    console.log('Success');
  } catch (error) {
    console.error(error);
  } finally {
    kuzzle.disconnect();
  }
};

run();
