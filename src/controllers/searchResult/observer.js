const DocumentsSearchResult = require('./document');
const Observer = require('../../core/Observer');

class ObserverSearchResult extends DocumentsSearchResult {

  /**
   * @param {Kuzzle} kuzzle
   * @param {object} request
   * @param {object} options
   * @param {object} response
   */
  constructor (kuzzle, request, options, response) {
    super(kuzzle, request, options, response);

    if (request.aggs || request.aggregations) {
      throw new Error('Aggregations are not supported for observers');
    }

    const hits = this.hits;
    this.hits = [];

    this.hits = hits.map(document => {
      const observer = new Observer(kuzzle, request.index, request.collection, document);

      observer.on('change', changes => {
        this.emit('change', observer._id, changes);
      });

      observer.on('delete', () => {
        this.emit('delete', observer._id,);
      });

      observer.on('error', error => {
        this.emit('error', observer._id, error);
      });

      return observer;
    });
  }

  start () {
    return Promise.all(this.hits.map(observer => observer.start()))
      .then(() => this);
  }

  stop () {
    return Promise.all(this.hits.map(observer => observer.stop()))
      .then(() => this);
  }

  _buildNextSearchResult (response) {
    const nextSearchResult = new this.constructor(this._kuzzle, this._request, this._options, response.result);

    nextSearchResult.fetched += this.fetched;

    return nextSearchResult.start();
  }

}

module.exports = ObserverSearchResult;
