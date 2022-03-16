import { InstrumentablePromise } from '../../core/InstrumentablePromise';
import { RequestPayload } from '../../types/RequestPayload';

export class PendingRequest extends InstrumentablePromise {
  public request: RequestPayload;

  constructor (request: RequestPayload) {
    super();

    this.request = request;
  }
}
