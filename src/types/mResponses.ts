import { JSONObject } from "./JSONObject";

type mResponseErrors = Array<{
  /**
   * Original document that caused the error
   */
  document: {
    _id: string;
    _source: JSONObject;
  };

  /**
   * HTTP error status code
   */
  status: number;

  /**
   * Human readable reason
   */
  reason: string;
}>;

export type mCreateResponse = {
  /**
   * Array of succeeded operations
   */
  successes: Array<{
    /**
     * Document unique identifier
     */
    _id: string;

    /**
     * Document content
     */
    _source: JSONObject;

    /**
     * Document version number
     */
    _version: number;

    /**
     * `true` if document is created
     */
    created: boolean;
  }>;

  /**
   * Arrays of errored operations
   */
  errors: mResponseErrors;
};

export type mCreateOrReplaceResponse = mCreateResponse;
export type mUpsertResponse = mCreateResponse;

export type mReplaceResponse = {
  /**
   * Array of succeeded operations
   */
  successes: Array<{
    /**
     * Document unique identifier
     */
    _id: string;

    /**
     * Document content
     */
    _source: JSONObject;

    /**
     * Document version number
     */
    _version: number;
  }>;

  /**
   * Arrays of errored operations
   */
  errors: mResponseErrors;
};

export type mUpdateResponse = mReplaceResponse;

export type mDeleteResponse = {
  /**
   * IDs of deleted documents
   */
  successes: string[];

  errors: Array<{
    /**
     * Document unique identifier
     */
    _id: string;

    /**
     * Human readable reason
     */
    reason: string;
  }>;
};
