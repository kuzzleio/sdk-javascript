const BaseController = require('./base');

class IndexController extends BaseController {

  /**
   * @param {Kuzzle} kuzzle
   */
  constructor (kuzzle) {
    super(kuzzle, 'index');
  }

  create (index, options) {
    const request = {
      index,
      action: 'create',
      refresh: options.refresh
    };
    delete options.refresh;
    return this.query(request, options)
      .then(response => response.result);
  }

  delete (index, options) {
    const request = {
      index,
      action: 'delete',
      refresh: options.refresh
    };
    delete options.refresh;
    return this.query(request, options)
      .then(response => response.result.acknowledged);
  }

  exists (index, options) {
    return this.query({
      index,
      action : 'exists'
    }, options)
      .then(response => response.result);
  }

  list (options) {
    return this.query({
      action: 'list'
    }, options)
      .then(response => response.result.indexes);
  }

  mDelete (indexes, options) {
    const request = {
      action: 'mDelete',
      body: {
        indexes
      },
      refresh: options.refresh
    };
    delete options.refresh;

    return this.query(request, options)
      .then(response => response.result.deleted);
  }
}

module.exports = IndexController;
