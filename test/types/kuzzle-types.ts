// The API contract types moved to kuzzle-types (Kuzzle ADR-0002 step 03): the
// SDK must still export every one of them, under the same name, as exactly
// kuzzle-types' type — kuzzle-types itself asserts those are the types
// kuzzle-sdk 7.17.1 exported. `Document` is the exception: the SDK keeps its
// class, whose instances kuzzle-types' interface describes.
// Type-checked by `npm run test:types` (after `npm run build`); nothing here runs.
import type * as Types from "kuzzle-types";

// The built declarations — what users get — not the non-strict sources.
import type * as Sdk from "../../out";

/** `true` only if A and B are identical types (not merely assignable). */
type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

/** Assignable both ways. */
type Mutual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

function assert<T extends true>(): T | void {}

type Content = Types.KDocumentContent & { name: string };

// src/types/ApiKey.ts
assert<Equals<Sdk.ApiKey, Types.ApiKey>>();
// src/types/ArgsDefault.ts
assert<Equals<Sdk.ArgsDefault, Types.ArgsDefault>>();
// src/types/BaseRequest.ts
assert<Equals<Sdk.BaseRequest, Types.BaseRequest>>();
// src/types/Document.ts
assert<Equals<Sdk.DocumentMetadata, Types.DocumentMetadata>>();
assert<Equals<Sdk.DocumentContent, Types.DocumentContent>>();
// src/types/HttpRoutes.ts
assert<Equals<Sdk.HttpRoutes, Types.HttpRoutes>>();
// src/types/JSONObject.ts
assert<Equals<Sdk.JSONObject, Types.JSONObject>>();
// src/types/KDocument.ts
assert<Equals<Sdk.KDocumentKuzzleInfo, Types.KDocumentKuzzleInfo>>();
assert<Equals<Sdk.KDocumentContent, Types.KDocumentContent>>();
assert<Equals<Sdk.KDocumentContentGeneric, Types.KDocumentContentGeneric>>();
assert<Equals<Sdk.KDocument<Content>, Types.KDocument<Content>>>();
assert<Equals<Sdk.KHit<Content>, Types.KHit<Content>>>();
// src/types/Mappings.ts
assert<Equals<Sdk.MappingsProperties, Types.MappingsProperties>>();
assert<Equals<Sdk.CollectionMappings, Types.CollectionMappings>>();
// src/types/Notification.ts
assert<Equals<Sdk.NotificationType, Types.NotificationType>>();
assert<Equals<Sdk.BaseNotification, Types.BaseNotification>>();
assert<
  Equals<Sdk.DocumentNotification<Content>, Types.DocumentNotification<Content>>
>();
assert<Equals<Sdk.UserNotification, Types.UserNotification>>();
assert<Equals<Sdk.ServerNotification, Types.ServerNotification>>();
assert<Equals<Sdk.Notification, Types.Notification>>();
// src/types/ProfilePolicy.ts
assert<Equals<Sdk.ProfilePolicy, Types.ProfilePolicy>>();
// src/types/RequestPayload.ts
assert<Equals<Sdk.RequestPayload, Types.RequestPayload>>();
// src/types/ResponsePayload.ts
assert<Equals<Sdk.ResponsePayload<Content>, Types.ResponsePayload<Content>>>();
// src/types/RoleRightsDefinition.ts
assert<Equals<Sdk.RoleRightsDefinition, Types.RoleRightsDefinition>>();
// src/types/mRequests.ts
assert<Equals<Sdk.mCreateRequest<Content>, Types.mCreateRequest<Content>>>();
assert<
  Equals<
    Sdk.mCreateOrReplaceRequest<Content>,
    Types.mCreateOrReplaceRequest<Content>
  >
>();
assert<Equals<Sdk.mReplaceRequest<Content>, Types.mReplaceRequest<Content>>>();
assert<Equals<Sdk.mUpdateRequest<Content>, Types.mUpdateRequest<Content>>>();
assert<Equals<Sdk.mUpsertRequest<Content>, Types.mUpsertRequest<Content>>>();
assert<Equals<Sdk.mDeleteRequest, Types.mDeleteRequest>>();
// src/types/mResponses.ts
assert<Equals<Sdk.mCreateResponse, Types.mCreateResponse>>();
assert<Equals<Sdk.mCreateOrReplaceResponse, Types.mCreateOrReplaceResponse>>();
assert<Equals<Sdk.mUpsertResponse, Types.mUpsertResponse>>();
assert<Equals<Sdk.mReplaceResponse, Types.mReplaceResponse>>();
assert<Equals<Sdk.mUpdateResponse, Types.mUpdateResponse>>();
assert<Equals<Sdk.mDeleteResponse, Types.mDeleteResponse>>();

// src/types/Document.ts — the class stays in the SDK, a runtime value.
assert<Mutual<Sdk.Document, Types.Document>>();
assert<Mutual<Sdk.DocumentHit, Types.DocumentHit>>();
export const document: typeof Sdk.Document = {} as typeof Sdk.Document;
