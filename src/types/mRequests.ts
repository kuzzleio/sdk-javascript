import { JSONObject } from './JSONObject';

export type mCreateRequest = {
  /**
   * Document unique identifier
   */
  _id?: string;

  /**
   * Document content
   */
  body: JSONObject;
};

export type mCreateOrReplaceRequest = {
  /**
   * Document unique identifier
   */
  _id: string;

  /**
   * Document content
   */
  body: JSONObject;
};

export type mReplaceRequest = mCreateOrReplaceRequest;
export type mUpdateRequest = mCreateOrReplaceRequest;

export type mUpsertRequest = {
  /**
   * Document unique identifier
   */
  _id: string;

  /**
   * Document partial changes
   */
  changes: JSONObject;

  /**
   * Document fields to add to the "update" part if the document is created
   */
  default?: JSONObject;
};

export type mDeleteRequest = string[];
