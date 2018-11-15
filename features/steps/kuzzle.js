const { Given, When, Then } = require('cucumber');
const should = require('should');

Given('Kuzzle Server is running', function () {
  return this.kuzzle.connect();
});


Then(/^I get an error(?: with status (.*))?$/, function (status) {
  should(this.error).not.be.null();

  if (status) {
    should(this.error.status).eql(parseInt(status));
  }
});

Then('I get a partial error', function () {
  should(this.error.status).eql(206);
});

Then('I get {string} and {string}', function (string1, string2) {
  should(this.content).be.an.Array();
  should(this.content.length).eql(2);

  for (const val of [string1, string2]) {
    should(this.content.indexOf(val)).be.greaterThanOrEqual(0);
  }
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

Then(/^the response '(.*)' field contains the pair '(.*)':'(.*)'$/, function (field, key, val) {
  should(this.content[field][key]).eql(val);
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



