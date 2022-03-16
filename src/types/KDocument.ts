import { JSONObject } from './JSONObject';

/**
 * Represents Kuzzle Metadata.
 */
export interface KDocumentKuzzleInfo {
  /**
   * Kuid of the user who created the document
   */
  author: string;

  /**
   * Creation date in micro-timestamp
   */
  createdAt: number;

  /**
   * Kuid of the user who last updated the document
   */
  updater: string | null;

  /**
   * Update date in micro-timestamp
   */
  updatedAt: number | null;
}

/**
 * Base interface for a Kuzzle document content
 */
export interface KDocumentContent {
  _kuzzle_info?: KDocumentKuzzleInfo;
}

/**
 * Generic kuzzle document content
 */
export interface KDocumentContentGeneric extends KDocumentContent, JSONObject {
}

/**
 * Represents a Kuzzle document
 *
 * Type argument represents the document content in the "_source" property
 */
export interface KDocument<TKDocumentContent extends KDocumentContent> {
  /**
   * Unique ID
   */
  _id: string;

  /**
   * Content
   */
  _source: TKDocumentContent;

  created?: boolean;

  _version?: number;
}

/**
 * Represents a Kuzzle document retrieved from search
 */
export interface KHit<TKDocumentContent extends KDocumentContent> extends KDocument<TKDocumentContent> {
  /**
   * Elasticsearch relevance score
   */
  _score: number;
}
