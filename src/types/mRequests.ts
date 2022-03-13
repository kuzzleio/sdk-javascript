import { KDocContentGeneric } from './KDoc';
import { JSONObject } from './JSONObject';

export type mCreateRequest<TKDocContent extends KDocContentGeneric> = Array<{
  /**
   * Document unique identifier
   */
  _id?: string;

  /**
   * Document content
   */
  body: Partial<TKDocContent>;
}>;

export type mCreateOrReplaceRequest<TKDocContent extends KDocContentGeneric> = Array<{
  /**
   * Document unique identifier
   */
  _id: string;

  /**
   * Document content
   */
  body: Partial<TKDocContent>;
}>;

export type mReplaceRequest<TKDocContent extends KDocContentGeneric> = mCreateOrReplaceRequest<TKDocContent>;
export type mUpdateRequest<TKDocContent extends KDocContentGeneric> = mCreateOrReplaceRequest<TKDocContent>;

export type mUpsertRequest<TKDocContent extends KDocContentGeneric> = Array<{
  /**
   * Document unique identifier
   */
  _id: string;

  /**
   * Document partial changes
   */
  changes: Partial<TKDocContent>;

  /**
   * Document fields to add to the "update" part if the document is created
   */
  default?: Partial<TKDocContent>;
}>;

export type mDeleteRequest = string[];
