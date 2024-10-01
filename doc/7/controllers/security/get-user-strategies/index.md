---
code: true
type: page
title: getUserStrategies
description: Gets all the available authentication strategies of a user
---

# getUserStrategies

<SinceBadge version="Kuzzle 2.9.0"/>
<SinceBadge version="7.6.0"/>

Gets all the available authentication strategies of a user.

<br />

```js
getUserStrategies(kuid, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `kuid` | <pre>string</pre> | User [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

Resolves to an array of strings containing all the authentication strategies available for the requested user.

## Usage

<<< ./snippets/get-user-strategies.js
