import { Kuzzle } from '../Kuzzle';
import { DocumentNotification } from '../types';
import { RealtimeDocument } from './RealtimeDocument';

export class RealtimeDocumentsHandler {
  private kuzzle: Kuzzle;
  private room: string = null;

  index: string;
  collection: string;
  realtimeDocuments: RealtimeDocument[];
  listening: boolean;

  constructor (kuzzle: Kuzzle, index: string, collection: string, realtimeDocuments: RealtimeDocument[]) {
    this.kuzzle = kuzzle;
    this.realtimeDocuments = realtimeDocuments;
    this.index = index;
    this.collection = collection;
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

        this.applyChanges(realtimeDocument, notification);
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

  private applyChanges (
    realtimeDocument: RealtimeDocument,
    notification: DocumentNotification
  ): void {
    if (notification.event === 'delete') {
      realtimeDocument.enabled = false;
      realtimeDocument.deleted = true;

      const index = this.realtimeDocuments.indexOf(realtimeDocument);

      this.realtimeDocuments.splice(index, index);

      realtimeDocument.emit('deleted');
    }
    else {
      const documentChanges = notification.result._source;

      if (realtimeDocument.mutate) {
        Object.assign(realtimeDocument._source, documentChanges);
      }

      realtimeDocument.emit('updated', notification);
    }
  }

}