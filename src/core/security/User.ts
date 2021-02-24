import { JSONObject } from '../../types';
import { Profile } from './Profile';

export class User {
  /**
   * Kuid (Kuzzle unique ID)
   */
  public _id: string;

  /**
   * User content
   */
  public _source: JSONObject;

  /**
   * User content
   *
   * @deprecated
   */
  get content (): JSONObject {
    return this._source;
  }

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
    this._source = content;
  }

  private get kuzzle () {
    return this._kuzzle;
  }

  /**
   * Array of profile IDs
   */
  get profileIds (): Array<string> {
    return this._source.profileIds || [];
  }

  /**
   * Gets user profile definitions from the API
   */
  getProfiles (): Promise<Array<Profile>> {
    if (!this.profileIds || this.profileIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.kuzzle.security.mGetProfiles(this.profileIds);
  }

}

module.exports = { User };

