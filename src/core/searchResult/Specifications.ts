import { SearchResultBase } from './SearchResultBase';
import { JSONObject } from '../../utils/interfaces';

export class SpecificationsSearchResult extends SearchResultBase<JSONObject> {

  constructor (kuzzle, query, options, response) {
    super(kuzzle, query, options, response);

    this._controller = 'collection';
    this._searchAction = 'searchSpecifications';
    this._scrollAction = 'scrollSpecifications';
  }
}
