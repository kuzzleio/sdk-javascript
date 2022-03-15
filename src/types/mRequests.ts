import { KDocumentContentGeneric } from './KDocument';

export type mCreateRequest<TKDocumentContent extends KDocumentContentGeneric> = Array<{
  /**
   * Document unique identifier
   */
  _id?: string;

  /**
   * Document content
   */
  body: Partial<TKDocumentContent>;
}>;

export type mCreateOrReplaceRequest<TKDocumentContent extends KDocumentContentGeneric> = Array<{
  /**
   * Document unique identifier
   */
  _id: string;

  /**
   * Document content
   */
  body: Partial<TKDocumentContent>;
}>;

export type mReplaceRequest<TKDocumentContent extends KDocumentContentGeneric> = mCreateOrReplaceRequest<TKDocumentContent>;
export type mUpdateRequest<TKDocumentContent extends KDocumentContentGeneric> = mCreateOrReplaceRequest<TKDocumentContent>;

export type mUpsertRequest<TKDocumentContent extends KDocumentContentGeneric> = Array<{
  /**
   * Document unique identifier
   */
  _id: string;

  /**
   * Document partial changes
   */
  changes: Partial<TKDocumentContent>;

  /**
   * Document fields to add to the "update" part if the document is created
   */
  default?: Partial<TKDocumentContent>;
}>;

export type mDeleteRequest = string[];
