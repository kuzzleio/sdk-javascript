import { RequestPayload } from '../../types/RequestPayload';

export class PendingRequest {
  private _resolve: any;
  private _reject: any;

  public promise: any;
  public request: RequestPayload;

  constructor (request: RequestPayload) {
    this._resolve = null;
    this._reject = null;
    this.request = request;

    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  resolve(...payload) {
    this._resolve(...payload);
  }

  reject (error) {
    this._reject(error);
  }
}
