const { Given, When, Then } = require('cucumber');
const should = require('should');

Given('Kuzzle Server is running', function () {
  return this.kuzzle.connect();
});


Then('I get a partial error', function () {
  should(this.error.status).eql(206);
});

Then('I should have no partial error', function () {
  if (this.error) {
    should(this.error.status)
      .not.equal(206);
  }
});

Then('the content should not be null', function () {
  should(this.content).not.be.null();
});

Then(/^I shall receive (.*?)$/, function (what) {
  if (/^\d+$/.test(what)) {
    what = parseInt(what);
  }
  else if (/^[\d.]+$/.test(what)) {
    what = parseFloat(what);
  }
  else if (/(true|false)/.test.what) {
    what = what === 'true';
  }

  should(this.content).eql(what);
});

Then('the result contains {int} hits', function (hits) {
  should(this.total).eql(hits);
});



