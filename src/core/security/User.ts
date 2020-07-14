import { JSONObject } from '../../utils/interfaces';
import { Profile } from './Profile';

export class User {
  /**
   * Kuid (Kuzzle unique ID)
   */
  public _id: string;
  /**
   * Custom content
   */
  public content: JSONObject;

  private _kuzzle: any;

  /**
   *
   * @param {Kuzzle} kuzzle
   * @param {Object} data
   */
  constructor (kuzzle, _id = null, content = {}) {
    Reflect.defineProperty(this, '_kuzzle', {
      value: kuzzle
    });

    this._id = _id;
    this.content = content;
  }

  private get kuzzle () {
    return this._kuzzle;
  }

  /**
   * Array of profile IDs
   */
  get profileIds (): string[] {
    return this.content.profileIds || [];
  }

  /**
   * Gets user profile definitions from the API
   */
  getProfiles (): Promise<Profile[]> {
    if (!this.profileIds || this.profileIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.kuzzle.security.mGetProfiles(this.profileIds);
  }

}

module.exports = { User };

