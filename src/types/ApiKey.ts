/**
 * ApiKey
 *
 * @see https://docs.kuzzle.io/core/2/guides/advanced/api-keys/
 */
export type ApiKey = {
  /**
   * ApiKey unique ID
   */
  _id: string;
  /**
   * ApiKey content
   */
  _source: {
    /**
     * User kuid
     */
    userId: string;
    /**
     * Expiration date in Epoch-millis format (-1 if the token never expires)
     */
    expiresAt: number;
    /**
     * Original TTL in ms
     */
    ttl: number;
    /**
     * API key description
     */
    description: string;
    /**
     * Authentication token associated with this API key
     */
    token: string;
  }
}
