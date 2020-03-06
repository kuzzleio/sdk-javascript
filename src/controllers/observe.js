const BaseController = require('./base');
const Observer = require('../core/Observer');
const ObserversSearchResult = require('./searchResult/observer');

class ObserveController extends BaseController {
  constructor (kuzzle) {
    super(kuzzle, 'observe');
  }

  get (index, collection, id) {
    return this.kuzzle.document.get(index, collection, id)
      .then(document => {
        const observer = new Observer(kuzzle, index, collection, document);

        return observer.start();
      });
  }

  mGet (index, collection, ids) {
    return this.kuzzle.document.mGet(index, collection, ids)
      .then(({ successes }) => {
        return successes.map(document => {
          const observer = new Observer(kuzzle, index, collection, document);

          return observer.start();
        });
      });
  }

  search (index, collection, searchBody, options) {
    return this.kuzzle.document._search(index, collection, searchBody, options)
      .then(({ response, request }) => (
        new ObserversSearchResult(this.kuzzle, request, options, response.result)
      ));
  }
}

module.exports = ObserveController;