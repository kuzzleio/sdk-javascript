const KuzzleEventEmitter = require('./KuzzleEventEmitter');

class Observer extends KuzzleEventEmitter {
  constructor(kuzzle, index, collection, document) {
    super();

    this._kuzzle = kuzzle;
    this._index = index;
    this._collection = collection;
    this._id = document._id;
    this._source = document._source;
  }

  start () {
    const filters = {
      ids: { values: [this._id] }
    };

    return this._kuzzle.realtime.subscribe(
      this._index,
      this._collection,
      filters,
      notification => {
        const documentChanges = notification.result._source;

        for (const [field, value] of Object.entries(documentChanges)) {
          this._source[field] = value;
        }

        this.emit('change', documentChanges);
      }
    )
      .then(() => this);
  }
}

module.exports = Observer;