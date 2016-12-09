// Type definitions for kuzzle-sdk [~OPTIONAL VERSION NUMBER~]
// Project: http://www.kuzzle.io
// Definitions by: Andréas 'ScreamZ' Hanss <https://github.com/ScreamZ>

import ResponseCallback = Kuzzle.ResponseCallback;
export as namespace Kuzzle;
export = Kuzzle;

declare class Kuzzle {
    // TODO : repasser sur les retours de fonction pour voir si ça renvoi kuzzle pour chainage
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

    /**
     * Gets the rights array of the currently logged user.
     *
     * @param callback - The callback containing the normalized array of rights.
     */
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

    /**
     * Kuzzle monitors active connections, and ongoing/completed/failed requests.
     * This method returns all available statistics from Kuzzle.
     *
     * @param options - Optionnal parameters
     * @param callback - The response callback
     */
    getAllStatistics(options: Kuzzle.QueuableOptions, callback: Kuzzle.EventHandlerCallback)

    /**
     * Kuzzle monitors active connections, and ongoing/completed/failed requests.
     * This method returns all available statistics from Kuzzle.
     *
     * @param callback - The response callback
     */
    getAllStatistics(callback: Kuzzle.EventHandlerCallback)

    /**
     * Kuzzle monitors active connections, and ongoing/completed/failed requests.
     * This method allows getting either the last statistics frame, or a set of frames starting from a provided timestamp.
     *
     * Note: Kuzzle statistics are cleaned up regularly. If the timestamp is set too far in the past, then this method will return all available statistics.
     *
     * @param timestamp -  Epoch time. Starting time from which the frames are to be retrieved
     * @param options - Optional parameters
     * @param callback - Handles the query response
     */
    getStatistics(timestamp: Kuzzle.EpochTime, options: Kuzzle.QueuableOptions, callback: Kuzzle.ResponseCallback)

    /**
     * Kuzzle monitors active connections, and ongoing/completed/failed requests.
     * This method allows getting either the last statistics frame, or a set of frames starting from a provided timestamp.
     *
     * Note: Kuzzle statistics are cleaned up regularly. If the timestamp is set too far in the past, then this method will return all available statistics.
     *
     * @param timestamp -  Epoch time. Starting time from which the frames are to be retrieved
     * @param callback - Handles the query response
     */
    getStatistics(timestamp: Kuzzle.EpochTime, callback: Kuzzle.ResponseCallback)

    /**
     * Kuzzle monitors active connections, and ongoing/completed/failed requests.
     * This method allows getting either the last statistics frame, or a set of frames starting from a provided timestamp.
     *
     * Note: Kuzzle statistics are cleaned up regularly. If the timestamp is set too far in the past, then this method will return all available statistics.
     *
     * @param options - Optional parameters
     * @param callback - Handles the query response
     */
    getStatistics(options: Kuzzle.QueuableOptions, callback: Kuzzle.ResponseCallback)

    /**
     * Kuzzle monitors active connections, and ongoing/completed/failed requests.
     * This method allows getting either the last statistics frame, or a set of frames starting from a provided timestamp.
     *
     * Note: Kuzzle statistics are cleaned up regularly. If the timestamp is set too far in the past, then this method will return all available statistics.
     *
     * @param callback - Handles the query response
     */
    getStatistics(callback: Kuzzle.ResponseCallback)

    /**
     * Create a new instance of a KuzzleDataCollection object.
     *
     * If no index is provided, the factory will take the default index set in the main Kuzzle instance.
     * If no default index has been set, an error is thrown.
     *
     * The index argument takes precedence over the default index.
     *
     * @param collection - The name of the data collection you want to manipulate
     * @param index - The name of the data index containing the data collection
     */
    dataCollectionFactory(collection: string, index?: string): Kuzzle.DataCollection;

    /**
     * Empties the offline queue without replaying it.
     */
    flushQueue(): Kuzzle

    /**
     * Returns the list of known persisted data collections.
     *
     * @param index - Index containing collections to be listed
     * @param options - Optional parameters
     * @param callback - Handles the query response
     */
    listCollections(index: string, options: Kuzzle.ListCollectionsOptions, callback: Kuzzle.ResponseCallback)

    /**
     * Returns the list of known persisted data collections.
     *
     * @param index - Index containing collections to be listed
     * @param callback - Handles the query response
     */
    listCollections(index: string, callback: Kuzzle.ResponseCallback)

    /**
     * Returns the list of known persisted data collections.
     *
     * @param options - Optional parameters
     * @param callback - Handles the query response
     */
    listCollections(options: Kuzzle.ListCollectionsOptions, callback: Kuzzle.ResponseCallback)

    /**
     * Returns the list of known persisted data collections.
     *
     * @param callback - Handles the query response
     */
    listCollections(callback: Kuzzle.ResponseCallback)

    /**
     * Returns the list of existing indexes in Kuzzle
     *
     * @param options - Optional arguments
     * @param callback - Handles the query response
     */
    listIndexes(options: Kuzzle.QueuableOptions, callback: Kuzzle.ResponseCallback)

    /**
     * Returns the list of existing indexes in Kuzzle
     *
     * @param callback - Handles the query response
     */
    listIndexes(callback: Kuzzle.ResponseCallback)

    /**
     * Disconnects from Kuzzle and invalidate this instance.
     */
    disconnect()

    /**
     * Retrieves information about Kuzzle, its plugins and active services.
     *
     * @param options - Optional arguments
     * @param callback - Handles the query response
     */
    getServerInfo(options: Kuzzle.QueuableOptions, callback: Kuzzle.ResponseCallback)

    /**
     * Retrieves information about Kuzzle, its plugins and active services.
     *
     * @param callback - Handles the query response
     */
    getServerInfo(callback: Kuzzle.ResponseCallback)

    /**
     * When writing or deleting documents in Kuzzle’s database layer, the update needs to be indexed before being reflected in the search index.
     *
     * By default, this operation can take up to 1 second.
     *
     * Given an index, the refresh action forces a refresh, on it, making the documents visible to search immediately.
     *
     * WARNING : A refresh operation comes with some performance costs.
     *
     * @param index - Optional. The index to refresh. If not set take the default initialized at Kuzzle object creation.
     * @param options - Optional parameters
     * @param callback - Callback handling the response.
     */
    refreshIndex(index?: string, options?: Kuzzle.ListCollectionsOptions, callback?: Kuzzle.ResponseCallback)

    /**
     * The getAutoRefresh function returns the current autoRefresh status for the given index.
     *
     * The autoRefresh flag, when set to true, will make Kuzzle perform a refresh request immediately after each write request, forcing the documents to be immediately visible to search.
     *
     * @param index - Optional index to query. If no set, defaults to the default
     * @param options - Optional parameters
     * @param callback - Callback handling the response
     */
    getAutoRefresh(index: string, options: Kuzzle.ListCollectionsOptions, callback: Kuzzle.ResponseCallback)

    /**
     * The getAutoRefresh function returns the current autoRefresh status for the given index.
     *
     * The autoRefresh flag, when set to true, will make Kuzzle perform a refresh request immediately after each write request, forcing the documents to be immediately visible to search.
     *
     * @param index - Optional index to query. If no set, defaults to the default
     * @param callback - Callback handling the response
     */
    getAutoRefresh(index: string, callback: Kuzzle.ResponseCallback)

    /**
     * The getAutoRefresh function returns the current autoRefresh status for the given index.
     *
     * The autoRefresh flag, when set to true, will make Kuzzle perform a refresh request immediately after each write request, forcing the documents to be immediately visible to search.
     *
     * @param options - Optional parameters
     * @param callback - Callback handling the response
     */
    getAutoRefresh(options: Kuzzle.ListCollectionsOptions, callback: Kuzzle.ResponseCallback)

    /**
     * The getAutoRefresh function returns the current autoRefresh status for the given index.
     *
     * The autoRefresh flag, when set to true, will make Kuzzle perform a refresh request immediately after each write request, forcing the documents to be immediately visible to search.
     *
     * @param callback - Callback handling the response
     */
    getAutoRefresh(callback: Kuzzle.ResponseCallback)

    /**
     * The autoRefresh flag, when set to true, will make Kuzzle perform a refresh request immediately after each write request, forcing the documents to be immediately visible to search.
     * Given an index, the setAutoRefresh function updates its autoRefresh status.
     *
     * @param index - The index to modify. Defaults to Kuzzle.defaultIndex
     * @param autoRefresh - The autoRefresh value to set
     * @param options - Optional arguments
     * @param callback - Handles the query result
     */
    setAutoRefresh(index: string, autoRefresh: boolean, options?: Kuzzle.QueuableOptions, callback?: Kuzzle.ResponseCallback): Kuzzle;

    /**
     * The autoRefresh flag, when set to true, will make Kuzzle perform a refresh request immediately after each write request, forcing the documents to be immediately visible to search.
     * Given an index, the setAutoRefresh function updates its autoRefresh status.
     *
     * @param autoRefresh - The autoRefresh value to set
     * @param options - Optional arguments
     * @param callback - Handles the query result
     */
    setAutoRefresh(autoRefresh: boolean, options?: Kuzzle.QueuableOptions, callback?: Kuzzle.ResponseCallback)

    /**
     * Return the current Kuzzle's UTC Epoch time, in milliseconds
     *
     * @param options - Optional parameters
     * @param callback - Handles the query response
     */
    now(options: Kuzzle.QueuableOptions, callback: Kuzzle.ResponseCallback): void;

    /**
     * This is a low-level method, exposed to allow advanced SDK users to bypass high-level methods.
     * Base method used to send read queries to Kuzzle
     *
     * Takes an optional argument object with the following properties:
     *    - metadata (object, default: null):
     *        Additional information passed to notifications to other users
     *
     * @param queryArgs - Query configuration
     * @param query - The query data
     * @param options - Optional arguments
     * @param callback - Handles the query response
     */
    query(queryArgs: Kuzzle.QueryArgs, query: any, options?: Kuzzle.QueryOptions, callback?: ResponseCallback): void;

    /**
     * Removes all listeners, either from a specific event or from all events
     *
     * @param event - One of the event described in the Event Handling section of this documentation
     */
    removeAllListeners(event?: string): Kuzzle;

    /**
     * Removes a listener from an event.
     *
     * @param event - One of the event described in the Event Handling section of this documentation
     * @param listenerId - The ID returned by addListener
     */
    removeListener(event: string, listenerId: string): Kuzzle;

    /**
     * Replays the requests queued during offline mode.
     *
     * Works only if the SDK is not in a disconnected state, and if the autoReplay option is set to false.
     */
    replayQueue(): Kuzzle;

    /**
     * Set the default data index. Has the same effect than the defaultIndex constructor option.
     */
    setDefaultIndex(index: string)

    /**
     * Helper function allowing to set headers while chaining calls.
     *
     * If the replace argument is set to true, replace the current headers with the provided content.
     * Otherwise, it appends the content to the current headers, only replacing already existing values
     *
     * @param content - new headers content
     * @param replace - default: false = append the content. If true: replace the current headers with tj
     */
    setHeaders(content: any, replace?: boolean): Kuzzle;

    /**
     * Starts the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
     */
    startQueuing(): Kuzzle;

    /**
     * Stops the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
     */
    stopQueuing(): Kuzzle;
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

    /**
     * Unix timestamp
     */
    export type EpochTime = string;

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
        offlineMode?: "auto" | "manual"
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

    export interface QueryOptions {
        metadata?: any;
        queuable?: boolean;
    }

    export interface ListCollectionsOptions {
        queuable?: boolean,
        type?: "all" | "stored" |"realtime"
    }

    export interface MessageOptions {
        metadata?: any;
        queuable?: boolean
    }

    export interface QueryArgs {
        controller: string;
        action: string;
        index?: string;
        collection?: string;
    }
}
