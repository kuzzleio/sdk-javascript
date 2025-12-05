import { Role } from "./Role";
import { JSONObject, ProfilePolicy } from "../../types";
import { Kuzzle } from "../../Kuzzle";

export class Profile {
  private _kuzzle: Kuzzle;

  /**
   * Profile unique ID
   */
  _id: string;

  /**
   * Maximum number of requests per second and per node with this profile
   */
  rateLimit: number;

  /**
   * Array of policies
   */
  policies: Array<ProfilePolicy>;

  // Other properties
  [property: string]: any;

  /**
   *
   * @param {Kuzzle} kuzzle
   * @param {Object} data
   */
  constructor(kuzzle: Kuzzle, _id: string = null, content: JSONObject = {}) {
    Reflect.defineProperty(this, "_kuzzle", {
      value: kuzzle,
    });

    this._id = _id;
    this.rateLimit = content && content.rateLimit ? content.rateLimit : 0;
    this.policies = content && content.policies ? content.policies : [];

    for (const [key, value] of Object.entries(content)) {
      if (this[key]) {
        continue;
      }

      this[key] = value;
    }
  }

  protected get kuzzle() {
    return this._kuzzle;
  }

  /**
   * Gets the associated roles definitions from the API.
   */
  getRoles(options = {}): Promise<Array<Role>> {
    if (!this.policies || this.policies.length === 0) {
      return Promise.resolve([]);
    }

    return this.kuzzle.security.mGetRoles(
      this.policies.map((policy) => policy.roleId),
      options,
    );
  }

  /**
   * Serialize the instance
   */
  serialize(): JSONObject {
    return {
      _id: this._id,
      policies: this.policies,
      rateLimit: this.rateLimit,
    };
  }
}
