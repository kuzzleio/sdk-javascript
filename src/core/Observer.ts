import { Kuzzle } from '../Kuzzle';
import { JSONObject, Document, DocumentNotification } from '../types';
import { KuzzleEventEmitter } from './KuzzleEventEmitter';

export class Observer extends KuzzleEventEmitter {
  private kuzzle: Kuzzle;
  private room: string;

  notifyOnly: boolean;
  listening: boolean;

  _index: string;
  _collection: string;
  _id: string;
  _source: JSONObject;
  _score: number;

  constructor(
    kuzzle: Kuzzle,
    index: string,
    collection: string,
    document: Document,
    options: JSONObject = {}
  ) {
    super();

    Reflect.defineProperty(this, 'kuzzle', {
      enumerable: false,
      value: kuzzle
    });

    Reflect.defineProperty(this, 'room', {
      writable: true,
      enumerable: false
    });

    Reflect.defineProperty(this, 'notifyOnly', {
      writable: true,
      enumerable: false,
      value: options.notifyOnly || false
    });

    this.listening = false;
    this._index = index;
    this._collection = collection;
    this._id = document._id;
    this._source = document._source;
    this._score = document._score;
  }

  start (): Promise<Observer> {
    const filters = {
      ids: { values: [this._id] }
    };

    return this.kuzzle.realtime.subscribe(
      this._index,
      this._collection,
      filters,
      (notification: DocumentNotification) => {
        if (notification.event === 'delete') {
          this.onDelete();
        }
        else {
          this.onChange(notification);
        }
      },
      { subscribeToSelf: true }
    )
      .then(room => {
        this.room = room;
        this.listening = true;

        return this;
      });
  }

  stop (): Promise<Observer> {
    return this.kuzzle.realtime.unsubscribe(this.room)
      .then(() => {
        this.room = null;
        this.listening = false;

        return this;
      });
  }

  private onChange (notification) {
    const documentChanges = notification.result._source;

    if (! this.notifyOnly) {
      Object.assign(this._source, documentChanges);
    }

    this.emit('change', documentChanges);
  }

  private onDelete () {
    this.emit('delete');

    this.stop()
      .catch(error => this.emit('error', error));
  }
}

module.exports = Observer;