import { Jwt } from "../core/Jwt";
import { BaseController } from "./Base";
import { User } from "../core/security/User";
import { JSONObject, ApiKey, ArgsDefault } from "../types";
import { RequestPayload } from "../types/RequestPayload";

/**
 * Auth controller
 *
 * @param kuzzle
 * @constructor
 */
export class AuthController extends BaseController {
  private _authenticationToken: any | null;

  /**
   * constructor
   * @param kuzzle
   */
  constructor(kuzzle) {
    super(kuzzle, "auth");

    this._authenticationToken = null;

    this.kuzzle.on("tokenExpired", () => {
      this._authenticationToken = null;
    });
  }

  /**
   *  Authentication token in use
   */
  get authenticationToken(): Jwt | null {
    return this._authenticationToken;
  }

  set authenticationToken(encodedJwt: string | null) {
    if (encodedJwt === undefined || encodedJwt === null) {
      this._authenticationToken = null;
    } else if (typeof encodedJwt === "string") {
      this._authenticationToken = new Jwt(encodedJwt);
    } else {
      throw new Error(`Invalid token argument: ${encodedJwt}`);
    }
  }

  /**
   * Do not add the token for the checkToken route, to avoid getting a token error when
   * a developer simply wishes to verify their token
   */
  authenticateRequest(request: RequestPayload): void {
    if (this.kuzzle.cookieAuthentication) {
      return;
    }

    if (
      !this.authenticationToken ||
      (request.controller === "auth" &&
        (request.action === "checkToken" || request.action === "login"))
    ) {
      return;
    }

    request.jwt = this.authenticationToken.encodedJwt;
  }

  /**
   * Creates a new API key for the currently logged user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/create-api-key
   *
   * @param description API key description
   * @param options Additional options
   *    - `_id` API key unique ID
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `expiresIn` Expiration duration
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns The created API key
   */
  createApiKey(
    description: string,
    options: ArgsAuthControllerCreateApiKey = {}
  ): Promise<ApiKey> {
    const request: Record<string, any> = {
      _id: options._id,
      action: "createApiKey",
      body: {
        description,
      },
      expiresIn: options.expiresIn,
      refresh: options.refresh,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response: any) => response.result
    );
  }

  /**
   * Checks if an API action can be executed by the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/check-rights
   *
   * @param requestPayload Request to check
   * @param options Additional options
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   */
  checkRights(
    requestPayload: RequestPayload,
    options: ArgsAuthControllerCheckRights = {}
  ): Promise<boolean> {
    const request: Record<string, any> = {
      action: "checkRights",
      body: requestPayload,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response: any) => response.result.allowed
    );
  }

  /**
   * Deletes an API key for the currently logged user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/delete-api-key
   *
   * @param id API key ID
   * @param options Additional options
   *    - `refresh` If set to `wait_for`, Kuzzle will not respond until the API key is indexed
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   */
  deleteApiKey(
    id: string,
    options: ArgsAuthControllerDeleteApiKey = {}
  ): Promise<null> {
    const request: Record<string, any> = {
      _id: id,
      action: "deleteApiKey",
      refresh: options.refresh,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(() => null);
  }

  /**
   * Searches API keys for the currently logged user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/search-api-keys
   *
   * @param query Search query
   * @param options Additional options
   *    - `from` Offset of the first document to fetch
   *    - `size` Maximum number of documents to retrieve per page
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns A search result object
   */
  searchApiKeys(
    query: JSONObject = {},
    options: ArgsAuthControllerSearchApiKeys = {}
  ): Promise<{
    /**
     * Array of found ApiKeys
     */
    hits: Array<ApiKey>;
    /**
     * Total number of API keys found
     */
    total: number;
  }> {
    const request: Record<string, any> = {
      action: "searchApiKeys",
      body: query,
      from: options.from,
      lang: options.lang,
      size: options.size,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response: any) => response.result
    );
  }

  /**
   * Checks whether a given jwt token still represents a valid session in Kuzzle.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/check-token
   *
   * @param token The jwt token to check (default to current SDK token)
   * @param options Additional options
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns A token validity object
   */
  checkToken(
    token?: string,
    options: ArgsAuthControllerCheckToken = {}
  ): Promise<{
    /**
     * Tell if the token is valid or not
     */
    valid: boolean;
    /**
     * Explain why the token is invalid
     */
    state: string;
    /**
     * Token expiration timestamp
     */
    expiresAt: number;
    /**
     * KUID of the user that the token belongs to
     */
    kuid: string;
  }> {
    let cookieAuth = false;
    if (token === undefined) {
      cookieAuth = this.kuzzle.cookieAuthentication;

      if (!cookieAuth && this.authenticationToken) {
        token = this.authenticationToken.encodedJwt;
      }
    }

    const request: Record<string, any> = {
      action: "checkToken",
      body: { token },
      cookieAuth,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, { queuable: false, ...options }).then(
      (response: any) => response.result
    );
  }

  /**
   * Create credentials of the specified strategy for the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/create-my-credentials
   *
   * @param strategy New credentials
   * @param credentials Name of the strategy to use
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns An object representing the new credentials.
   *    The content depends on the authentication strategy
   */
  createMyCredentials(
    strategy: string,
    credentials: JSONObject,
    options: ArgsAuthControllerCreateMyCredentials = {}
  ): Promise<JSONObject> {
    const request: Record<string, any> = {
      action: "createMyCredentials",
      body: credentials,
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response: any) => response.result
    );
  }

  /**
   * Check the existence of the specified strategy's credentials for the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/credentials-exist
   *
   * @param strategy Name of the strategy to use
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns A boolean indicating if the credentials exist
   */
  credentialsExist(
    strategy: string,
    options: ArgsAuthControllerCredentialsExist = {}
  ): Promise<boolean> {
    const request: Record<string, any> = {
      action: "credentialsExist",
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response: any) => response.result
    );
  }

  /**
   * Delete credentials of the specified strategy for the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/delete-my-credentials
   *
   * @param strategy Name of the strategy to use
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   */
  deleteMyCredentials(
    strategy: string,
    options: ArgsAuthControllerDeleteMyCredentials = {}
  ): Promise<boolean> {
    const request: Record<string, any> = {
      action: "deleteMyCredentials",
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response: any) => response.result.acknowledged
    );
  }

  /**
   * Fetches the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/get-current-user
   *
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns Currently logged User
   */
  getCurrentUser(
    options: ArgsAuthControllerGetCurrentUser = {}
  ): Promise<User> {
    const request: Record<string, any> = {
      action: "getCurrentUser",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response: any) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  /**
   * Get credential information of the specified strategy for the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/get-my-credentials
   *
   * @param strategy Name of the strategy to use
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns An object representing the credentials for the provided authentication strategy.
   *    Its content depends on the authentication strategy.
   */
  getMyCredentials(
    strategy: string,
    options: ArgsAuthControllerGetMyCredentials = {}
  ): Promise<JSONObject> {
    const request: Record<string, any> = {
      action: "getMyCredentials",
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response: any) => response.result
    );
  }

  /**
   * Gets the rights array of the currently logged user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/get-my-rights
   *
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns An array containing user rights objects
   */
  getMyRights(options: ArgsAuthControllerGetMyRights = {}): Promise<
    Array<{
      /**
       * Controller on which the rights are applied
       */
      controller: string;
      /**
       * Action on which the rights are applied
       */
      action: string;
      /**
       * Index on which the rights are applied
       */
      index: string;
      /**
       * Collection on which the rights are applied
       */
      collection: string;
      /**
       * Rights ("allowed" or "denied")
       */
      value: string;
    }>
  > {
    const request: Record<string, any> = {
      action: "getMyRights",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response: any) => response.result.hits
    );
  }

  /**
   * Get all the strategies registered in Kuzzle by all auth plugins.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/get-strategies
   *
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns An array of available strategies names
   */
  getStrategies(
    options: ArgsAuthControllerGetStrategies = {}
  ): Promise<Array<string>> {
    const request: Record<string, any> = {
      action: "getStrategies",
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response: any) => response.result
    );
  }

  /**
   * Send login request to kuzzle with credentials.
   * If cookieAuthentication is false and login succeeds, store the jwt into the kuzzle object.
   * If cookieAuthentication is true and login succeeds, the token is stored in a cookie.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/login
   *
   * @param strategy Name of the strategy to use
   * @param credentials Credentials object for the strategy
   * @param expiresIn Expiration time in ms library format. (e.g. "2h")
   *
   * @returns The encrypted JSON Web Token
   */
  login(
    strategy: string,
    credentials: JSONObject,
    expiresIn?: string | number
  ): Promise<string | void> {
    const request: Record<string, any> = {
      action: "login",
      body: credentials,
      cookieAuth: this.kuzzle.cookieAuthentication,
      expiresIn,
      strategy,
    };

    this.kuzzle.emit("beforeLogin");

    return this.query(request, { queuable: false, timeout: -1, verb: "POST" })
      .then((response: any) => {
        if (this.kuzzle.cookieAuthentication) {
          if (response.result.jwt) {
            const err = new Error(
              "Kuzzle support for cookie authentication is disabled or not supported"
            );
            this.kuzzle.emit("loginAttempt", {
              error: err.message,
              success: false,
            });
            this.kuzzle.emit("afterLogin", {
              error: err.message,
              success: false,
            });
            throw err;
          }

          this.kuzzle.emit("loginAttempt", { success: true });
          this.kuzzle.emit("afterLogin", { success: true });
          return;
        }

        this._authenticationToken = new Jwt(response.result.jwt);

        this.kuzzle.emit("loginAttempt", { success: true });
        this.kuzzle.emit("afterLogin", { success: true });

        return response.result.jwt;
      })
      .catch((err: any) => {
        this.kuzzle.emit("loginAttempt", {
          error: err.message,
          success: false,
        });
        this.kuzzle.emit("afterLogin", {
          error: err.message,
          success: false,
        });

        throw err;
      });
  }

  /**
   * Send logout request to kuzzle with jwt.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/logout
   */
  async logout(): Promise<void> {
    this.kuzzle.emit("beforeLogout");
    try {
      await this.query(
        {
          action: "logout",
          cookieAuth: this.kuzzle.cookieAuthentication,
        },
        { queuable: false, timeout: -1 }
      );
      this._authenticationToken = null;
      /**
       * @deprecated logout `logoutAttempt` is legacy event. Use afterLogout instead.
       */
      this.kuzzle.emit("logoutAttempt", { success: true });
      this.kuzzle.emit("afterLogout", { success: true });
    } catch (error) {
      /**
       * @deprecated logout `logoutAttempt` is legacy event. Use afterLogout instead.
       */
      this.kuzzle.emit("logoutAttempt", {
        error: (error as Error).message,
        success: false,
      });
      this.kuzzle.emit("afterLogout", {
        error: (error as Error).message,
        success: false,
      });

      throw error;
    }
  }

  /**
   * Update credentials of the specified strategy for the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/update-my-credentials
   *
   * @param strategy Name of the strategy to use
   * @param credentials Updated credentials
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns An object representing the updated credentials.
   *    The content depends on the authentication strategy
   */
  updateMyCredentials(
    strategy: string,
    credentials: JSONObject,
    options: ArgsAuthControllerUpdateMyCredentials = {}
  ): Promise<JSONObject> {
    const request: Record<string, any> = {
      action: "updateMyCredentials",
      body: credentials,
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response: any) => response.result
    );
  }

  /**
   * Update current user in Kuzzle.
   * This route cannot update the list of associated security profiles.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/update-self
   *
   * @param {object} content - User custom information
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns Currently logged User
   */
  updateSelf(
    content: JSONObject,
    options: ArgsAuthControllerUpdateSelf = {}
  ): Promise<User> {
    const request: Record<string, any> = {
      action: "updateSelf",
      body: content,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response: any) =>
        new User(this.kuzzle, response.result._id, response.result._source)
    );
  }

  /**
   * Validate credentials of the specified strategy for the current user.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/validate-my-credentials
   *
   * @param strategy Name of the strategy to use
   * @param credentials Credentials to validate
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   */
  validateMyCredentials(
    strategy: string,
    credentials: JSONObject,
    options: ArgsAuthControllerValidateMyCredentials = {}
  ): Promise<boolean> {
    const request: Record<string, any> = {
      action: "validateMyCredentials",
      body: credentials,
      strategy,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then(
      (response: any) => response.result
    );
  }

  /**
   * Refresh the SDK current authentication token.
   *
   * @see https://docs.kuzzle.io/sdk/js/7/controllers/auth/refresh-token
   *
   * @param options Additional options
   *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
   *    - `expiresIn` Expiration duration
   *    - `timeout` Request Timeout in ms, after the delay if not resolved the promise will be rejected
   *    - `triggerEvents` Forces pipes to execute even when called from EmbeddedSDK
   *
   * @returns The refreshed token
   */
  refreshToken(options: ArgsAuthControllerRefreshToken = {}): Promise<{
    /**
     * Token unique ID
     */
    _id: string;
    /**
     * Expiration date in Epoch-millis format (-1 if the token never expires)
     */
    expiresAt: number;
    /**
     * Authentication token associated with this API key
     */
    jwt: string;
    /**
     * Original TTL in ms
     */
    ttl: number;
  }> {
    const request: Record<string, any> = {
      action: "refreshToken",
      cookieAuth: this.kuzzle.cookieAuthentication,
      expiresIn: options.expiresIn,
    };

    if (options.triggerEvents !== undefined) {
      request.triggerEvents = options.triggerEvents;
    }

    return this.query(request, options).then((response: any) => {
      if (!this.kuzzle.cookieAuthentication) {
        this._authenticationToken = new Jwt(response.result.jwt);
      }

      return response.result;
    });
  }
}

export interface ArgsAuthControllerCreateApiKey extends ArgsDefault {
  _id?: string;
  expiresIn?: number;
  refresh?: "wait_for" | "false";
}

export type ArgsAuthControllerCheckRights = ArgsDefault;

export interface ArgsAuthControllerDeleteApiKey extends ArgsDefault {
  refresh?: "wait_for" | "false";
}

export interface ArgsAuthControllerSearchApiKeys extends ArgsDefault {
  from?: number;
  size?: number;
  lang?: string;
}

export type ArgsAuthControllerCheckToken = ArgsDefault;

export type ArgsAuthControllerCreateMyCredentials = ArgsDefault;

export type ArgsAuthControllerCredentialsExist = ArgsDefault;

export type ArgsAuthControllerDeleteMyCredentials = ArgsDefault;

export type ArgsAuthControllerGetCurrentUser = ArgsDefault;

export type ArgsAuthControllerGetMyCredentials = ArgsDefault;

export type ArgsAuthControllerGetMyRights = ArgsDefault;

export type ArgsAuthControllerGetStrategies = ArgsDefault;

export type ArgsAuthControllerUpdateMyCredentials = ArgsDefault;

export type ArgsAuthControllerUpdateSelf = ArgsDefault;

export type ArgsAuthControllerValidateMyCredentials = ArgsDefault;

export interface ArgsAuthControllerRefreshToken extends ArgsDefault {
  expiresIn?: number | string;
}
