const BaseController = require('./base');

class BulkController extends BaseController {
  constructor (kuzzle) {
    super(kuzzle, 'bulk');
  }

  import (data, options) {
    return this.query({
      action: 'import',
      body: {
        bulkData: data
      }
    }, options)
      .then(response => response.result);
  }

}

module.exports = BulkController;
