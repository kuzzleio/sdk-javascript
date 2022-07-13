import { Kuzzle } from "../Kuzzle";
import { JSONObject } from "../types";
import { RequestPayload } from "../types/RequestPayload";

export class BaseController {
  private _name: string;
  private _kuzzle: Kuzzle;

  /**
   * @param {Kuzzle} kuzzle - Kuzzle SDK object.
   * @param {string} name - Controller full name for API request.
   */
  constructor(kuzzle: any, name: string) {
    Reflect.defineProperty(this, "_kuzzle", {
      value: kuzzle,
    });

    this._name = name;
  }

  protected get kuzzle() {
    return this._kuzzle;
  }

  /**
   * Controller name
   */
  get name() {
    return this._name;
  }

  /**
   * Sends a query to Kuzzle.
   * If not set, the "controller" property of the request will be the controller name.
   *
   * @param request
   * @param options
   */
  query(request: RequestPayload = {}, options: any = {}): Promise<JSONObject> {
    request.controller = request.controller || this.name;

    return this._kuzzle.query(request, options);
  }
}
