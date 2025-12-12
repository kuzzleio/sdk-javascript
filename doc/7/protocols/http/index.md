---
code: true
type: page
title: Http
description: Http protocol documentation
order: 600
---

# Http

The Http protocol can be used by an instance of the SDK to communicate with your Kuzzle server.

::: info
This protocol does not allow to use the [real-time notifications](/sdk/js/7/essentials/realtime-notifications).

If you need real-time features, then you have to use the [WebSocket](/sdk/js/7/protocols/websocket) protocol.
:::

## About HTTP routing

<SinceBadge version="6.2.0"/>

This protocol needs to build routes from the name of the controller and the action used. These routes are made available by Kuzzle via the [server:publicApi](/core/2/api/controllers/server/public-api) method or the [server:info](/core/2/api/controllers/server/info) method.

<SinceBadge version="Kuzzle 1.9.0"/>
For confidentiality reasons, it is preferable to expose only the `server:publicApi` route to the anonymous user.  
If this route is not available, the SDK will use the static definition of API routes that does not include routes developed in plugins.

Finally, it is also possible to manually define the routes to the actions of its plugins using the `customRoutes` option with the [Http protocol constructor](/sdk/js/7/protocols/http/constructor).

# Properties

| Property name | Type               | Description                                                           | Get/Set |
| ------------- | ------------------ | --------------------------------------------------------------------- | ------- |
| `connected`   | <pre>boolean</pre> | Always returns `true`                                                 | Get     |
| `host`        | <pre>string</pre>  | Kuzzle server host                                                    | Get     |
| `http`        | <pre>object</pre>  | Returns a list of available routes <DeprecatedBadge version="6.2.0"/> | Get     |
| `routes`      | <pre>object</pre>  | Returns a list of available routes <SinceBadge version="6.2.0"/>      | Get     |
| `port`        | <pre>number</pre>  | Kuzzle server port                                                    | Get     |
| `protocol`    | <pre>string</pre>  | `https` or `http`                                                     | Get     |
| `ssl`         | <pre>boolean</pre> | `true` if ssl is active                                               | Get     |
| `timeout`     | <pre>number</pre>  | Connection timeout in milliseconds <SinceBadge version="6.2.1"/>      | Get/Set |

**Note:**

A `timeout` of 0 means that the connection will never timeout.

# Constructor

Use this constructor to create a new instance of the `Http` protocol with specific options.

## Arguments

```js
Http(host, [options]);
```

<br/>

| Argument  | Type              | Description                  |
| --------- | ----------------- | ---------------------------- |
| `host`    | <pre>string</pre> | Kuzzle server hostname or IP |
| `options` | <pre>object</pre> | Http connection options      |

### options

Http protocol connection options.

| Property        | Type<br/>(default)               | Description                                                                             |
| --------------- | -------------------------------- | --------------------------------------------------------------------------------------- |
| `customRoutes`  | <pre>object</pre><br/>(`{}`)     | Add custom routes <SinceBadge version="6.2.0"/>                                         |
| `headers`       | <pre>object</pre><br/>(`{}`)     | Default headers sent with each HTTP request <SinceBadge version="7.7.5"/>               |
| `port`          | <pre>number</pre><br/>(`7512`)   | Kuzzle server port                                                                      |
| `sslConnection` | <pre>boolean</pre><br/>(`false`) | Use SSL to connect to Kuzzle server <DeprecatedBadge version="7.4.0"/>                  |
| `ssl`           | <pre>boolean</pre><br/>(`false`) | Use SSL to connect to Kuzzle server. Defaults to `true` for ports 443 and 7443.         |
| `timeout`       | <pre>number</pre><br/>(`0`)      | Connection timeout in milliseconds (`0` means no timeout) <SinceBadge version="6.2.1"/> |

**Note:**

`customRoutes` are used to define plugins API routes or to overwrite existing API routes.  
They must have the following format:

```js
{
  'my-plugin/my-controller': {
    action: { verb: 'GET', url: '/some/url' },
    action2: { verb: 'GET', url: '/some/url/with/:parameter' }
  }
}
```

## Return

A `Http` protocol instance.

## Usage

<<< ./snippets/constructor.js
