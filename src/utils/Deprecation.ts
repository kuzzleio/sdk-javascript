export class Deprecation {

  private _deprecationWarning: boolean;

  constructor (deprecationWarning: boolean) {
    this._deprecationWarning = deprecationWarning;
  }

  logDeprecation (response) {
      if(this._deprecationWarning && response.deprecations?.length) {
        response.deprecations.forEach(deprecation => {
          console.warn(deprecation.message)
        });
      }
      return response;
  }
}