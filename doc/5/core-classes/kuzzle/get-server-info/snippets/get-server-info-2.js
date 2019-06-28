on
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
