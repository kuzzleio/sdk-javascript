const _kuzzle = Symbol();

class BulkController {
  constructor (kuzzle) {
    this[_kuzzle] = kuzzle;
  }

  get kuzzle () {
    return this[_kuzzle];
  }

  import (data, options) {
    return this.kuzzle.query({
      controller: 'bulk',
      action: 'import',
      body: {
        bulkData: data
      }
    }, options)
      .then(response => response.result);
  }

}

module.exports = BulkController;
