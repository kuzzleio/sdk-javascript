const { Given, When, Then } = require("cucumber");
const should = require("should");

Given(
  /^I subscribe to '(.*?)'(?: with '(.*)' as filter)?$/,
  function (collection, filter) {
    if (!filter) {
      filter = "{}";
    }

    return this.kuzzle.realtime
      .subscribe(this.index, collection, JSON.parse(filter), this.callback)
      .then((content) => {
        this.content = content;
      });
  }
);

Given("I unsubscribe", function () {
  return this.kuzzle.realtime.unsubscribe(this.content);
});

When("I publish a document", function () {
  return this.kuzzle.realtime.publish(this.index, this.collection, {
    a: "document",
  });
});

Then("I receive a notification", function (cb) {
  setTimeout(() => {
    try {
      should(this.notifications.length).eql(1);
      cb();
    } catch (e) {
      cb(e);
    }
  }, 1000);
});

Then("I do not receive a notification", function (cb) {
  setTimeout(() => {
    try {
      should(this.notifications.length).eql(0);
      cb();
    } catch (e) {
      cb(e);
    }
  }, 1000);
});
