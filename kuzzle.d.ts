// Type definitions for kuzzle-sdk [~OPTIONAL VERSION NUMBER~]
// Project: http://www.kuzzle.io
// Definitions by: Andréas 'ScreamZ' Hanss <https://github.com/ScreamZ>

export as namespace Kuzzle;
export = Kuzzle;

declare class Kuzzle {
    security: Kuzzle.Security;

    /**
     * @param host - Server name or IP Address to the Kuzzle instance
     * @param options - Initialization options
     */
    constructor(host: string, options?: Kuzzle.ConnectOptions);

    /**
     * Connects to a Kuzzle instance using the provided host name.
     */
    connect(): Kuzzle

    /**
     * Sets the internal JWT token which will be used to request Kuzzle.
     *
     * If the provided token is correct, a loginAttempt event is fired with the following object:
     * { success: true }
     *
     * If not, the loginAttempt event is fired with the following response:
     * { success: false, error: 'error message' }
     *
     * @param jwt - The string representing the token
     */
    setJwtToken(jwt: string): Kuzzle;

    /**
     * Unset the internal JWT token used for authentication, and stops all existing subscriptions
     */
    unsetJwtToken(): Kuzzle;

    /**
     * Get the jwtToken used by kuzzle
     */
    getJwtToken(): string;

    /**
     * Log a user according to a strategy and credentials.
     *
     * If the Kuzzle response contains a JWT Token, the SDK token is set and the loginAttempt event is fired immediately with the following object:
     * { success: true }
     * This is the case, for instance, with the local authentication strategy.
     *
     * If the request succeeds but there is no token, then it means that the chosen strategy is a two-steps authentication method, like OAUTH. In that case, the loginAttempt event is not fired. To complete the login attempt, the setJwtToken method must be called either with a token or with an appropriate Kuzzle response.
     *
     * If the login attempt fails, the loginAttempt event is fired with the following response:
     * { success: false, error: 'error message' }
     *
     * @param strategy
     * @param credential
     * @param expiresIn
     * @param callback
     */
    login(strategy: string, credential: {username: string; password: string}, expiresIn: string, callback: Kuzzle.ResponseCallback): Kuzzle;

    /**
     * Logs the user out.
     *
     * Resolves to the Kuzzle object itself once the logout process is complete, either successfully or not.
     * The Kuzzle object will unset the property jwtToken if the user is successfully logged out.
     *
     * @param callback
     */
    logout(callback: Kuzzle.ResponseCallback): Kuzzle;

    checkToken(jwt: string, callback: Kuzzle.ResponseCallback): void;

    /**
     * Return informations about the currently logged user.
     *
     * @param callback
     */
    whoAmI(callback: (err: any, result: any)=>any): void;

    /**
     * Gets the rights array of the currently logged user.
     *
     * @param options - Optional parameters
     * @param callback - The callback containing the normalized array of rights.
     */
    getMyRights(options: Kuzzle.QueuableOptions, callback: Kuzzle.ResponseCallback): void;
    getMyRights(callback: Kuzzle.ResponseCallback): void;

    /**
     * Performs a partial update on the current user.
     *
     * @param content - A plain javascript object representing the user.
     * @param options - Optionals arguments
     * @param callback - The response callback
     */
    updateSelf(content: any, options?: Kuzzle.QueuableOptions, callback?: Kuzzle.ResponseCallback);

    /**
     * TODO : Wait improvement of Kuzzle documentation about this to specify callback arguments.
     *
     * Adds a listener to a Kuzzle global event.
     * When an event is fired, listeners are called in the order of their insertion.
     */
    addListener(event: string, listener: Kuzzle.EventHandlerCallback)

    getAllStatistics(timestamp: any, options: Kuzzle.QueuableOptions, callback: any)
    getAllStatistics(timestamp: any, options: Kuzzle.QueuableOptions, callback: any)
    getAllStatistics(timestamp: any, options: Kuzzle.QueuableOptions, callback: any)
    getAllStatistics(timestamp: any, options: Kuzzle.QueuableOptions, callback: any)

    getStatistics()

    /**
     *
     * @param index
     * @param collection
     *
     * @return DataCollection
     */
    dataCollectionFactory(index?: string, collection?: string): Kuzzle.DataCollection;

    flushQueue()

    listCollections()

    listIndexes()

    disconnect()

    getServerInfo()

    refreshIndex()

    getAutoRefresh()

    setAutoRefresh()

    now()

    query()

    removeAllListeners()

    removeListener()

    replayQueue()

    setDefaultIndex()

    setHeaders()

    startQueuing()

    stopQueuing()
}

declare namespace Kuzzle {

    /**
     * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
     *
     * @param Error object, NULL if the query is successful
     * @param {Object} [data] - The content of the query response
     */
    export type ResponseCallback = (err: any, data: any) => void;

    /**
     * See specific event to know arguments
     */
    export type EventHandlerCallback = (...args) => void;

    export interface DataCollection {
        publishMessage(document: any, options?: MessageOptions): any;
        createDocument(document: any, callback?: ResponseCallback): any;
        updateDocument(documentId: any, document: any, callback?: ResponseCallback): any;
        deleteDocument(documentId: any, callback?: ResponseCallback): any;
        subscribe(filters: any, options: any, callback: ResponseCallback): any;
        fetchDocument(documentID: string, callback?: ResponseCallback): any
        advancedSearch(filters: Object, options: any, callback: ResponseCallback): any;
    }

    export interface Security {
        searchUsers(filter: any, options?: any, callback?: (err: any, res: any) => any): any
    }


    export type OfflineModes = "auto" | "manual"

    export interface ConnectOptions {
        autoQueue?: boolean
        autoReconnect?: boolean
        autoReplay?: boolean
        autoResubscribe?: boolean
        connect?: string
        defaultIndex?: string
        headers?: any
        ioPort?: number
        metadata?: any
        offlineMode?: OfflineModes
        port?: number
        queueTTL?: number
        queueMaxSize?: number
        replayInterval?: number
        reconnectionDelay?: number
        wsPort?: number
    }

    export interface QueuableOptions {
        queuable: boolean
    }

    export interface MessageOptions {
        metadata?: any;
        queuable?: boolean
    }
}
