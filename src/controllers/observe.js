const BaseController = require('./base');
const Observer = require('../core/Observer');
const ObserverSearchResult = require('./searchResult/observer');

class ObserveController extends BaseController {
  constructor (kuzzle) {
    super(kuzzle, 'observe');
  }

  get (index, collection, id) {
    return this.kuzzle.document.get(index, collection, id)
      .then(document => {
        const observer = new Observer(this.kuzzle, index, collection, document);

        return observer.start();
      });
  }

  mGet (index, collection, ids) {
    return this.kuzzle.document.mGet(index, collection, ids)
      .then(({ successes }) => {
        return Promise.all(successes.map(document => {
          const observer = new Observer(this.kuzzle, index, collection, document);

          return observer.start();
        }));
      });
  }

  search (index, collection, searchBody, options) {
    return this.kuzzle.document._search(index, collection, searchBody, options)
      .then(({ response, request }) => {
        const result = new ObserverSearchResult(this.kuzzle, request, options, response.result)

        return result.start();
      });
  }
}

module.exports = ObserveController;