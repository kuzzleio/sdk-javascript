---
code: false
type: page
title: Strong Typing
description: Use strong typing for more safety
order: 700
---

# Strong Typing

The SDK exposes numerous types to help Typescript developer to maintain a safer codebase and prevents obvious errors.

## Kuzzle Document (KDocument)

<SinceBadge version="7.9.0"/>

The Document controller methods can be used with an explicit type that represents the content of the manipulated document.

Document content must be defined by extending the `KDocumentContent` interface.

```js
interface DeviceContent extends KDocumentContent {
  model: string;
  reference: string;
  battery: number;
}

const device = await sdk.document.get<DeviceContent>('iot', 'devices', 'abeeway-H72K2');
```

The returned type is `KDocument<DeviceContent>` and it contains a `_source` property of type `DeviceContent`.

::: info
By default, a generic document content with only a strongly defined `_kuzzle_info` property is returned.
:::

## Kuzzle.query method

<SinceBadge version="auto-version"/>

The [Kuzzle.query](/sdk/js/7/core-classes/kuzzle/query) method can accept 2 optional types.

Those types are used to strongly type both the request payload and the response result for each API action used.

```js
query<TRequest extends BaseRequest, TResult> (
  req: TRequest,
  opts: JSONObject = {},
): Promise<ResponsePayload<TResult>>;
```

You can define the `TRequest` type by extending the `BaseRequest` type. It corresponds to the payload sent to Kuzzle API.

```js
interface NotificationSmsRequest extends BaseRequest {
  body: {
    phone: string;
    message: string;
  }
}
```

The `TResult` is just a definition of the expected result for the API action.

```js
interface NotificationSmsResult {
  smsCount: number;
}
```

The complete usage with strong typing will be:

```js
const { result } = await sdk.query<NotificationSmsRequest, NotificationSmsResult>({
  controller: 'notification',
  action: 'sms',
  body: {
    phone: '+33629951621',
    message: 'Hello, world',
  }
});

result.smsCount; // number
```