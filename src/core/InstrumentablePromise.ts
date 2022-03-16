export class InstrumentablePromise {
  public promise: Promise<any>;
  public resolve: (...any) => any;
  public reject: (...any) => any;

  constructor () {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
