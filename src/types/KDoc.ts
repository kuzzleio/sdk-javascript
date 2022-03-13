import { JSONObject } from './JSONObject';

/**
 * Represents Kuzzle Metadata.
 */
export interface KDocKuzzleInfo {
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
export interface KDocContent {
  _kuzzle_info: KDocKuzzleInfo;
}

/**
 * Generic kuzzle document content
 */
export interface KDocContentGeneric extends KDocContent, JSONObject {
}

/**
 * Represents a Kuzzle document
 *
 * Type argument represents the document content in the "_source" property
 */
export interface KDoc<TKDocContent extends KDocContent> {
  /**
   * Unique ID
   */
  _id: string;

  /**
   * Content
   */
  _source: TKDocContent;

  created?: boolean;

  _version?: number;
}

/**
 * Represents a Kuzzle document retrieved from search
 */
export interface KHit<TKDocContent extends KDocContent> extends KDoc<TKDocContent> {
  /**
   * Elasticsearch relevance score
   */
  _score: number;
}