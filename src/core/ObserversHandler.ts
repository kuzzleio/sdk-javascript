import { Kuzzle } from '../Kuzzle';
import { DocumentNotification } from '../types';
import { Observer } from './Observer';

export class ObserversHandler {
  private kuzzle: Kuzzle;
  private room: string;

  index: string;
  collection: string;
  observers: Observer[];
  listening: boolean;

  constructor (kuzzle: Kuzzle, index: string, collection: string, observers: Observer[]) {
    this.kuzzle = kuzzle;
    this.observers = observers;
    this.index = index;
    this.collection = collection;

    for (const observer of this.observers) {
      observer.on('delete', () => {
        const index = this.observers.indexOf(observer);

        this.observers.splice(index, index);
      })
    }
  }

  start (): Promise<void> {
    if (this.listening) {
      return Promise.resolve();
    }

    const ids = this.observers.map(({ _id }) => _id);
    const filters = {
      ids: { values: ids }
    };

    return this.kuzzle.realtime.subscribe(
      this.index,
      this.collection,
      filters,
      (notification: DocumentNotification) => {
        const observer = this.observers
          .find(({ _id }) => _id === notification.result._id);

        if (! observer) {
          throw Error(`Receive notification for unknown observer "${notification.result._id}"`);
        }

        observer.applyChanges(notification);
      },
      { subscribeToSelf: true }
    )
      .then(room => {
        this.room = room;
        this.listening = true;

        for (const observer of this.observers) {
          observer.enabled = true;
        }
      });
  }

  stop (): Promise<void> {
    if (! this.listening) {
      return Promise.resolve();
    }

    return this.kuzzle.realtime.unsubscribe(this.room)
      .then(() => {
        this.room = null;
        this.listening = false;

        for (const observer of this.observers) {
          observer.enabled = false;
        }
      });
  }
}