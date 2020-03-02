class Document {
  constructor(kuzzle, response) {
    this._id = response.result._id;
    this._source = response.result._source;
    this._index = response.index;
    this._collection = response.collection;
    this._kuzzle = kuzzle;
  }

  subscribe () {
    const filters = {
      ids: { values: [this._id] }
    };

    return this._kuzzle.realtime.subscribe(
      this._index,
      this._collection,
      filters,
      notification => {
        for (const [field, value] of Object.entries(notification.result._source)) {
          this._source[field] = value;
        }
      }
    )
      .then(() => this);
  }
}

module.exports = Document;