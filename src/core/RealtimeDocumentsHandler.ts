import { Kuzzle } from '../Kuzzle';
import { DocumentNotification } from '../types';
import { RealtimeDocument } from './RealtimeDocument';

export class RealtimeDocumentsHandler {
  private kuzzle: Kuzzle;
  private room: string;

  index: string;
  collection: string;
  realtimeDocuments: RealtimeDocument[];
  listening: boolean;

  constructor (kuzzle: Kuzzle, index: string, collection: string, realtimeDocuments: RealtimeDocument[]) {
    this.kuzzle = kuzzle;
    this.realtimeDocuments = realtimeDocuments;
    this.index = index;
    this.collection = collection;

    for (const realtimeDocument of this.realtimeDocuments) {
      realtimeDocument.on('delete', () => {
        const index = this.realtimeDocuments.indexOf(realtimeDocument);

        this.realtimeDocuments.splice(index, index);
      })
    }
  }

  start (): Promise<void> {
    if (this.listening || this.realtimeDocuments.length === 0) {
      return Promise.resolve();
    }

    const ids = this.realtimeDocuments.map(({ _id }) => _id);
    const filters = {
      ids: { values: ids }
    };

    return this.kuzzle.realtime.subscribe(
      this.index,
      this.collection,
      filters,
      (notification: DocumentNotification) => {
        const realtimeDocument = this.realtimeDocuments
          .find(({ _id }) => _id === notification.result._id);

        if (! realtimeDocument) {
          throw Error(`Receive notification for unknown realtimeDocument "${notification.result._id}"`);
        }

        realtimeDocument.applyChanges(notification);
      },
      { subscribeToSelf: true }
    )
      .then(room => {
        this.room = room;
        this.listening = true;

        for (const realtimeDocument of this.realtimeDocuments) {
          realtimeDocument.enabled = true;
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

        for (const realtimeDocument of this.realtimeDocuments) {
          realtimeDocument.enabled = false;
        }
      });
  }
}