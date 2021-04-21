---
code: true
type: page
title: createApiKey
description: Creates a new API key for the currently logged user.
---

# createApiKey

<SinceBadge version="7.1.0" />

<SinceBadge version="Kuzzle 2.1.0" />

Creates a new API key for the currently logged user.

<br />

```js
createApiKey(description, [options]);
```

<br />

| Property      | Type              | Description         |
| ------------- | ----------------- | ------------------- |
| `description` | <pre>string</pre> | API key description |
| `options`     | <pre>object</pre> | Additional options  |

### options

Additional query options

| Property    | Type<br />(default)                  | Description                                                                                                           |
| ----------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `expiresIn` | <pre>string/number</pre><br />(`-1`) | Expiration duration                                                                                                   |
| `_id`       | <pre>string</pre><br />(`null`)      | API key unique ID                                                                                                     |
| `refresh`   | <pre>boolean</pre><br />(`false`)    | If set to `wait_for`, Kuzzle will not respond until the API key is indexed                                            |
| `timeout`   | <pre>number</pre><br/>(`-1`)         | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

**Notes**:
- `expiresIn`:
  - if a raw number is provided (not enclosed between quotes), then the expiration delay is in milliseconds. Example: `86400000`
  - if this value is a string, then its content is parsed by the [ms](https://www.npmjs.com/package/ms) library. Examples: `"6d"`, `"10h"`
  - if `-1` is provided, the token will never expire

## Resolves

An object containing the newly created API key:

| Name      | Type              | Description                     |
| --------- | ----------------- | ------------------------------- |
| `_id`     | <pre>string</pre> | ID of the newly created API key |
| `_source` | <pre>object</pre> | API key content                 |

The API key content has the following properties:

| Name          | Type              | Description                                                              |
| ------------- | ----------------- | ------------------------------------------------------------------------ |
| `userId`      | <pre>string</pre> | User kuid                                                                |
| `expiresAt`   | <pre>number</pre> | Expiration date in Epoch-millis format (`-1` if the token never expires) |
| `ttl`         | <pre>number</pre> | Original TTL                                                             |
| `description` | <pre>string</pre> | API key description                                                      |
| `token`       | <pre>string</pre> | Authentication token associated with this API key                        |

::: warning
The authentication token `token` will never be returned by Kuzzle again. If you lose it, you'll have to delete the API key and recreate a new one.
:::

## Usage

<<< ./snippets/create-api-key.js
