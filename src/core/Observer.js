const KuzzleEventEmitter = require('./KuzzleEventEmitter');

const DELETE_ACTIONS = ['delete', 'mDelete', 'deleteByQuery'];

class Observer extends KuzzleEventEmitter {
  constructor(kuzzle, index, collection, document, options = {}) {
    super();

    Reflect.defineProperty(this, '_kuzzle', {
      writable: true,
      value: kuzzle
    });

    Reflect.defineProperty(this, '_room', {
      writable: true
    });

    Reflect.defineProperty(this, 'notifyOnly', {
      writable: true,
      value: options.notifyOnly || false
    });

    this._listening = false;
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
        if (DELETE_ACTIONS.includes(notification.action)) {
          this._onDelete();
        }
        else {
          this._onChange(notification);
        }
      },
      { subscribeToSelf: true }
    )
      .then(room => {
        this._room = room;
        this._listening = true;

        return this;
      });
  }

  stop () {
    return this._kuzzle.realtime.unsubscribe(this._room)
      .then(() => {
        this._room = undefined;
        this._listening = false;

        return this;
      });
  }

  _onChange (notification) {
    const documentChanges = notification.result._source;

    if (! this.notifyOnly) {
      Object.assign(this._source, documentChanges);
    }

    this.emit('change', documentChanges);
  }

  _onDelete () {
    this.emit('delete');

    this.stop()
      .catch(error => this.emit('error', error));
  }
}

module.exports = Observer;