class Document {
  constructor(kuzzle, response) {
    this._id = response.result._id;
    this._source = response.result._source;
    this._index = response.index;
    this._collection = response.collection;
    this._kuzzle = kuzzle;
  }

  subscribe (callback = null, ...callbackArgs) {
    const filters = {
      ids: { values: [this._id] }
    };

    return this._kuzzle.realtime.subscribe(
      this._index,
      this._collection,
      filters,
      notification => {
        const body = notification.result._source;

        for (const [field, value] of Object.entries(body)) {
          this._source[field] = value;
        }

        if (callback) {
          callback(...callbackArgs, body);
        }
      }
    )
      .then(() => this);
  }
}

module.exports = Document;