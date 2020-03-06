const DocumentsSearchResult = require('./document');
const Observer = require('../../core/Observer');

class ObserversSearchResult extends DocumentsSearchResult {

  /**
   * @param {Kuzzle} kuzzle
   * @param {object} request
   * @param {object} options
   * @param {object} response
   */
  constructor (kuzzle, request, options, response) {
    super(kuzzle, request, options, response);

    const hits = this.hits;
    this.hits = [];

    this._promises = hits.map(document => {
      const observer = new Observer(kuzzle, request.index, request.collection, document);

      return observer.start()
        .then(observer => this.hits.push(observer));
    });
  }

  wait () {
    return Promise.all(this._promises);
  }

}

module.exports = ObserversSearchResult;
