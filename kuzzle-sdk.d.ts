import { resolve } from "dns";

/**
 * Type definitions for Kuzzle javascript SDK.
 * 
 * Project: Kuzzle Javascript SDK - https://github.com/kuzzleio/sdk-javascript
 * Definitions by: Andréas 'ScreamZ' HANSS <andreas.hanss67@gmail.com>
 * ---
 * Github: https://github.com/ScreamZ
 * LinkedIn: https://www.linkedin.com/in/andreas-hanss/
 * 
 * If you find any issues, feel free to report or make a pull request.
 */
declare module "kuzzle-sdk" {
    import { Explanation, Refresh } from "elasticsearch"

    export class Kuzzle {
        public autoQueue: boolean;
        public autoReplay: boolean;
        public autoResubscribe: boolean;
        public jwt: string;
        public offlineQueueLoader: () => Array<{ query: KuzzleRequest, resolve: (response: KuzzleResponse) => Promise<any>, reject: (error: KuzzleError) => Promise<any> }>;
        public queueFilter: (request: KuzzleRequest) => boolean
        public queueMaxSize: number;
        public queueTTL: number;
        public replayInterval: number;
        public volatile: ObjectWithAnyKeys;
        public readonly offlineQueue: ObjectWithAnyKeys[]
        public readonly protocol: KuzzleAbstractProtocol

        constructor(protocol: KuzzleAbstractProtocol, options: KuzzleOptions);

        // Core
        addListener(event: KuzzleEvent, handler: (event: any) => void): Kuzzle;
        connect(): Promise<void>;
        disconnect(): void;
        flushQueue(): Kuzzle;
        playQueue(): Kuzzle;
        query(request: KuzzleRequest, options?: QueryOptions): KuzzleResponse
        startQueuing(): Kuzzle;
        stopQueuing(): Kuzzle;

        // Modules
        auth: KuzzleModules.Auth
        bulk: KuzzleModules.Bulk
        collection: KuzzleModules.Collection
        document: KuzzleModules.Document
        index: KuzzleModules.Index
        ms: KuzzleModules.Ms
        realtime: KuzzleModules.Realtime
        server: KuzzleModules.Server
    }

    export interface KuzzleAbstractProtocol {
        readonly name: string
    }

    export class Http implements KuzzleAbstractProtocol {
        public readonly name: string;
        constructor(host: string, options?: {
            port?: number;
            sslConnection?: boolean;
        })
    }
    export class Websocket implements KuzzleAbstractProtocol {
        public readonly name: string;
        public readonly autoReconnect: boolean
        public readonly reconnectionDelay: number

        constructor(host: string, options?: {
            port?: number;
            sslConnection?: boolean;
            autoReconnect?: boolean;
            reconnectionDelay?: number;
        })
    }
    export class SocketIO implements KuzzleAbstractProtocol {
        public readonly name: string;
        public readonly autoReconnect: boolean
        public readonly reconnectionDelay: number

        constructor(host: string, options?: {
            port?: number;
            sslConnection?: boolean;
            autoReconnect?: boolean;
            reconnectionDelay?: number;
        })
    }

    type ObjectWithAnyKeys = {
        [propName: string]: any;
        [propName: number]: any;
    }

    interface QueryOptions extends ObjectWithAnyKeys {
        queuable?: boolean;
    }

    interface RefreshableOptions extends QueryOptions {
        refresh?: Refresh
    }

    interface RefreshRetryOptions extends RefreshableOptions {
        retryOnConflict?: number;
    }

    interface PaginatorOptions extends QueryOptions {
        from?: number;
        size?: number;
    }

    interface ScrollOptions extends PaginatorOptions {
        scroll?: string
    }

    type RealtimeScope = "in" | "out"
    interface SubscribeOptions {
        scope?: "all" | RealtimeScope | "none";
        users?: "all" | RealtimeScope | "none";
        subscribeToSelf?: boolean;
        volatile?: ObjectWithAnyKeys
    }

    interface KuzzleOptions {
        autoQueue?: boolean;
        autoReplay?: boolean;
        autoReconnect?: boolean;
        autoResubscribe?: boolean;
        eventTimeout?: number;
        offlineMode?: "manual" | "auto";
        queueTTL?: number;
        queueMaxSize?: number;
        replayInterval?: number;
        volatile?: ObjectWithAnyKeys;
    }

    enum KuzzleEvent {
        CONNECTED = "connected",
        DISCARDED = "discarded",
        DISCONNECTED = "disconnected",
        LOGIN_ATTEMPT = "loginAttempt",
        NETWORK_ERROR = "networkError",
        OFFLINE_QUEUE_POP = "offlineQueuePop",
        OFFLINE_QUEUE_PUSH = "offlineQueuePush",
        QUERY_ERROR = "queryError",
        RECONNECTER = "reconnected",
        TOKEN_EXPIRED = "tokenExpired",
    }

    class KuzzleError extends Error {
        status: number;
        stack?: string;
    }

    /**
     * A Kuzzle request to use with the query method.
     * 
     * Genericity consider body as object by default but you can set it to whatever you want.
     *
     * @interface KuzzleRequest
     * @template BodyObject
     */
    interface KuzzleRequest<BodyObject = any> {
        controller: string;
        action: string;
        body?: BodyObject
        index?: string;
        collection?: string;
        _id?: string;
        volatile?: ObjectWithAnyKeys
    }

    interface KuzzleResponse<QueryResult = any> {
        action: string;
        collection: string;
        controller: string;
        error: KuzzleError;
        index: string;
        requestId: string;
        result: QueryResult;
        status: number;
        volatile: ObjectWithAnyKeys;
    }

    interface WebsocketEventDocument extends KuzzleResponse {
        timestamp: number;
        volatile: ObjectWithAnyKeys;
        protocol: string;
        scope: RealtimeScope;
        type: "document" | "user";
        room: string;
    }


    interface KuzzleSearchResult<Source> {
        max_score: number;
        hits: Array<{
            _index: string;
            _type: string;
            _id: string;
            _score: number;
            _source: Source;
            _version?: number;
            _explanation?: Explanation;
            fields?: any;
            highlight?: any;
            inner_hits?: any;
            matched_queries?: string[];
            sort?: string[];
        }>;
        scrollId?: string
        aggregations: ObjectWithAnyKeys
        total: number;
        fetched: number;
        scroll_id?: string;
        next(): Promise<KuzzleSearchResult<Source>>
    }

    interface KuzzleUser<UserData> {
        id: string
        content: UserData & { profileIds: string[], _kuzzle_info: KuzzleMetadata }
    }

    interface KuzzleMetadata {
        author: string;
        createdAt: number,
        updatedAt: number | null,
        updater: string,
        active: boolean,
        deletedAt: number | null
    }

    interface KuzzleRights {
        controller: string;
        action: string;
        index: string;
        collection: string;
        value: string;
    }

    // Modules
    namespace KuzzleModules {
        interface Auth {
            checkToken(token: string): Promise<{ valid: boolean, state: string, expired_at: number }>;
            createMyCredentials(strategy: string, credentials: ObjectWithAnyKeys, options?: QueryOptions): Promise<{ valid: boolean, state: string, expired_at: number }>;
            credentialsExist(strategy: string, options?: QueryOptions): Promise<boolean>;
            deleteMyCredentials(strategy: string, options?: QueryOptions): Promise<boolean>;
            getCurrentUser<KUser>(options?: QueryOptions): Promise<KuzzleUser<KUser>>;
            getMyCredentials<Credentials>(strategy: string, options?: QueryOptions): Promise<Credentials>;
            getMyRights(options?: QueryOptions): Promise<KuzzleRights[]>;
            getStrategies(options?: QueryOptions): Promise<string[]>;
            login(strategy: string, credentials?: ObjectWithAnyKeys, expiresIn?: string): Promise<string>;
            logout(): Promise<void>;
            updateMyCredentials<Credentials>(strategy: string, credentials?: Credentials, options?: QueryOptions): Promise<Credentials>;
            updateSelf<KUser>(content: { [propName: string]: any; }, options?: QueryOptions): Promise<KuzzleUser<KUser>>;
            validateMyCredentials<KUser>(strategy: string, credentials?: ObjectWithAnyKeys, options?: QueryOptions): Promise<boolean>;
        }

        interface Bulk {
            import(data: ObjectWithAnyKeys[], options?: QueryOptions): Promise<{ hits: ObjectWithAnyKeys[] }>;
        }

        interface Collection {
            create(index: string, collection: string, mapping?: ObjectWithAnyKeys, options?: QueryOptions): Promise<void>
            deleteSpecifications(index: string, collection: string, options?: QueryOptions): Promise<void>
            exists(index: string, collection: string, options?: QueryOptions): Promise<boolean>
            getMapping(index: string, collection: string, options?: QueryOptions): Promise<ObjectWithAnyKeys>
            getSpecifications(index: string, collection: string, options?: QueryOptions): Promise<CollectionSpecification>
            list(index: string, options?: PaginatorOptions): Promise<{ type: CollectionType, collections: CollectionObject[] } & PaginatorOptions>
            searchSpecifications(body?: ObjectWithAnyKeys[], options?: ScrollOptions): Promise<KuzzleSearchResult<CollectionSpecification[]>>;
            truncate(index: string, collection: string, options?: QueryOptions): Promise<void>
            updateMapping(index: string, collection: string, mapping: ObjectWithAnyKeys, options?: QueryOptions): Promise<void>
            updateSpecifications(index: string, collection: string, specification: CollectionSpecification, options?: QueryOptions): Promise<void>
            validateSpecifications(index: string, collection: string, specification: CollectionSpecification, options?: QueryOptions): Promise<{ valid: boolean, details: string[], description: string }>
        }

        type CollectionSpecification = {
            strict: boolean;
            fields: ObjectWithAnyKeys
        }
        type CollectionType = "all" | "realtime" | "stored"
        type CollectionObject = { type: CollectionType, name: string }

        interface Document {
            count(index: string, collection: string, query: ObjectWithAnyKeys, options?: QueryOptions): Promise<number>;
            create(index: string, collection: string, document: ObjectWithAnyKeys, id?: string, options?: RefreshableOptions): Promise<{ _id: string, _version: number, _source: ObjectWithAnyKeys }>;
            createOrReplace(index: string, collection: string, id: string, document: ObjectWithAnyKeys, options?: RefreshableOptions): Promise<{ _id: string, _version: number, _source: ObjectWithAnyKeys }>;
            delete(index: string, collection: string, id: string, options?: RefreshableOptions): Promise<string>;
            deleteByQuery(index: string, collection: string, query?: ObjectWithAnyKeys, options?: RefreshableOptions): Promise<string[]>;
            get(index: string, collection: string, id: string, options?: QueryOptions): Promise<ObjectWithAnyKeys>;
            mCreate(index: string, collection: string, documents: ObjectWithAnyKeys[], options?: RefreshableOptions): Promise<{ hits: ObjectWithAnyKeys[], total: number }>;
            mCreateOrReplace(index: string, collection: string, documents: ObjectWithAnyKeys[], options?: RefreshableOptions): Promise<{ hits: ObjectWithAnyKeys[], total: number }>;
            mDelete(index: string, collection: string, ids: string[], options?: RefreshableOptions): Promise<ObjectWithAnyKeys[]>
            mGet(index: string, collection: string, ids: string[], options?: QueryOptions) // TODO: Return type
            mReplace(index: string, collection: string, documents: ObjectWithAnyKeys[], options?: RefreshableOptions)// TODO: Return type
            mUpdate(index: string, collection: string, documents: ObjectWithAnyKeys[], options?: RefreshRetryOptions)// TODO: Return type
            replace(index: string, collection: string, id: string, document: ObjectWithAnyKeys, options?: RefreshableOptions): Promise<{ _id: string, _version: number, _source: ObjectWithAnyKeys }>
            search<T>(index: string, collection: string, query?: ObjectWithAnyKeys, options?: ScrollOptions): Promise<KuzzleSearchResult<T>>
            update(index: string, collection: string, id: string, document: ObjectWithAnyKeys, options?: RefreshRetryOptions): Promise<ObjectWithAnyKeys>;
            validate(index: string, collection: string, document: ObjectWithAnyKeys, options?: QueryOptions): Promise<boolean>;
        }

        interface Index {
            create(index: string, options?: QueryOptions): Promise<{ acknowledged: boolean, shards_acknowledged: boolean }>;
            delete(index: string, options?: QueryOptions): Promise<void>;
            exists(index: string, options?: QueryOptions): Promise<boolean>;
            getAutoRefresh(index: string, options?: QueryOptions): Promise<boolean>;
            list(options?: QueryOptions): Promise<string[]>;
            mdelete(indexes: string[], options?: QueryOptions): Promise<string[]>;
            refresh(index: string, options?: QueryOptions): Promise<{ total: number, successful: number, failed: number }>;
            refreshInternal(index?: string, options?: QueryOptions): Promise<boolean>;
            setAutoRefresh(index: string, autoRefresh: boolean, options?: QueryOptions): Promise<boolean>;
        }

        interface Ms extends ObjectWithAnyKeys { // TODO: Once ready

        }

        interface Realtime {
            count(roomId: string, options?: QueryOptions): Promise<number>
            publish(index: string, collection: string, message: ObjectWithAnyKeys, options?: QueryOptions): Promise<boolean>
            subscribe(index: string, collection: string, filters: ObjectWithAnyKeys, callback: (eventObject: WebsocketEventDocument) => void, options?: SubscribeOptions): Promise<string>
            unsubscribe(roomId: string, options?: QueryOptions): Promise<void>
        }

        interface Server {
            adminExists(options?: QueryOptions): Promise<boolean>
            getAllStats(options?: QueryOptions): Promise<ObjectWithAnyKeys>
            getConfig(options?: QueryOptions): Promise<ObjectWithAnyKeys>
            getLastStats(options?: QueryOptions): Promise<ObjectWithAnyKeys>
            getStats(startTime: number | string, stopTime: number | string, options?: QueryOptions): Promise<ObjectWithAnyKeys>
            info(options?: QueryOptions): Promise<ObjectWithAnyKeys>
            now(options?: QueryOptions): Promise<number>
        }
    }
}