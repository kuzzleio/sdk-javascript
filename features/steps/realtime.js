const {Given, When, Then} = require('cucumber');
const should = require('should');

Given(/^I subscribe to '(.*?)'(?: with '(.*)' as filter)?$/, async function (collection, filter) {
  if (!filter) {
    filter = '{}';
  }

  this.content = await this.kuzzle.realtime.subscribe(this.index, collection, JSON.parse(filter), this.callback);
});

Given('I unsubscribe', async function () {
  await this.kuzzle.realtime.unsubscribe(this.content);
});

When('I publish a document', async function () {
  await this.kuzzle.realtime.publish(this.index, this.collection, {
    a: 'document'
  });
});


Then('I receive a notification', function (cb) {
  setTimeout(() => {
    should(this.notifications.length).eql(1);
    cb();
  }, 1000);
});

Then('I do not receive a notification', function (cb) {
  setTimeout(() => {
    should(this.notifications.length).eql(0);
    cb();
  }, 1000);
});
