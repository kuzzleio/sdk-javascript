---
code: false
type: page
title: getServerInfo
description: Kuzzle:getServerInfo
---

# getServerInfo

> Callback response example:

```json
{
  "kuzzle": {
    "api": {
      "routes": {
        "controller1": {
          "action1": {
            "controller": "controller1",
            "action": "action1",
            "http": {
              "verb": "GET",
              "url": "/action1/url"
            }
          },
          "action2": {
            "controller": "controller1",
            "action": "action2",
            "http": {
              "verb": "POST",
              "url": "/action2/url"
            }
          },
          {
            "...": "..."
          }
        },
        "pluginName/controller": {
          "action": {
            "controller": "pluginName/controller",
            "action": "action",
            "http": {
              "verb": "GET",
              "url": "/action/url"
            }
          },
          {
            "...": " ..."
          }
        },
        {
          "...": "..."
        }
      },
      "version": "<API version>"
    },
    "memoryUsed": 12345,
    "nodeVersion": "v6.9.5",
    "plugins": {},
    "system": {
      "cpus": [
        {
          "cpu1": "informations"
        },
        {
          "...": "..."
        }
      ],
      "memory": {
        "free": 123456,
        "total": 1234567
      }
    },
    "uptime": "<uptime, in seconds>",
    "version": "<kuzzle version>"
  },
  "services": {
    "internalCache": {
      "kuzzle memory cache": "informations",
      "...": "..."
    },
    "memoryStorage": {
      "API memory storage": "informations",
      "...": "..."
    },
    {
      "...": "..."
    }
  }
}
```

Retrieves information about Kuzzle plugins and active services.

---

## getServerInfo([options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `options`  | JSON object | Optional parameters |
| `callback` | function    | Optional callback   |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns a JSON object containing server information.

## Usage

<<< ./snippets/get-server-info-1.js
