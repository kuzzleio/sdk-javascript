Kuzzle
======

## About Kuzzle

For UI and linked objects developers, Kuzzle is an open-source solution that handles all the data management (CRUD, real-time storage, search, high-level features, etc).

[You can access to the Kuzzle repository here](https://github.com/kuzzleio/kuzzle)

A connector to the Kuzzle API

## Installation

### nodeJs

```
npm install kuzzle-sdk --save
```

#### Basic usage

```javascript
var kuzzleUrl = 'http://localhost:7512',
  kuzzle = require('node-kuzzle')(kuzzleUrl);

var myDoc = {
  name: 'Rick Astley',
  birthDate: '1966/02/06',
  mainActivity: 'Singer',
  website: 'http://www.rickastley.co.uk',
  comment: 'Never gonna give you up, never gonna let you down'
};

kuzzle.create('people', myDoc, true, function(error, response) {
  if (error) {
    // handle error...
  }
  /*
  If everything is ok, response should contain :
  { _index: 'mainindex',
     _type: 'people',
     _id: 'AU7V79B426DqjnR4i97D',
     _version: 1,
     created: true,
     requestId: '3084e648-0977-4d81-822d-c04538f3dfd1',
     controller: 'write',
     action: 'create',
     collection: 'people',
     _source: {
        name: 'Rick Astley',
        birthDate: '1966/02/06',
        mainActivity: 'Singer',
        website: 'http://www.rickastley.co.uk',
        comment: 'Never gonna give you up, never gonna let you down'
      }
  }
  */
});

```

#### Hate callbacks & love promises ?

All the kuzzle member functions are available using promises, just suffix them with ```Promise``` like ```createPromise```.
With promises, the above example become:

```javascript
var kuzzleUrl = 'http://localhost:7512',
  kuzzle = require('node-kuzzle')(kuzzleUrl);

var myDoc = {
  name: 'Rick Astley',
  birthDate: '1966/02/06',
  mainActivity: 'Singer',
  website: 'http://www.rickastley.co.uk',
  comment: 'Never gonna give you up, never gonna let you down'
};

kuzzle
  .createPromise('people', myDoc, true)
  .then(function(response) {
  /*
  If everything is ok, response should contain :
  { _index: 'mainindex',
     _type: 'people',
     _id: 'AU7V79B426DqjnR4i97D',
     _version: 1,
     created: true,
     requestId: '3084e648-0977-4d81-822d-c04538f3dfd1',
     controller: 'write',
     action: 'create',
     collection: 'people',
     _source: {
        name: 'Rick Astley',
        birthDate: '1966/02/06',
        mainActivity: 'Singer',
        website: 'http://www.rickastley.co.uk',
        comment: 'Never gonna give you up, never gonna let you down'
      }
  }
  */
  })
  .catch(function(error){
    // handle the error...
  })
  ;

```

### HTML

#### Vanilla

Download the file [kuzzle.min.js](kuzzle.min.js) at TODO: COMPLETE_URL and the following to your HTML file:

```
<script src="https://cdn.socket.io/socket.io-1.3.4.js"></script>
<script type="text/javascript" src="path/to/kuzzle.min.js"></script>
```
You are now ready for:

```javascript
// Init kuzzle object
var kuzzle = Kuzzle.init('http://localhost:7512');

var myDoc = {
  name: 'Rick Astley',
  birthDate: '1966/02/06',
  mainActivity: 'Singer',
  website: 'http://www.rickastley.co.uk',
  comment: 'Never gonna give you up, never gonna let you down'
};

kuzzle.create('people', myDoc, true, function(error, response) {
  if (error) {
    // handle error...
  }
  /*
  If everything is ok, response should contain :
  { _index: 'mainindex',
     _type: 'people',
     _id: 'AU7V79B426DqjnR4i97D',
     _version: 1,
     created: true,
     requestId: '3084e648-0977-4d81-822d-c04538f3dfd1',
     controller: 'write',
     action: 'create',
     collection: 'people',
     _source: {
        name: 'Rick Astley',
        birthDate: '1966/02/06',
        mainActivity: 'Singer',
        website: 'http://www.rickastley.co.uk',
        comment: 'Never gonna give you up, never gonna let you down'
      }
  }
  */
});

```

### AMD / Require.js

TODO


## API overview

### Note

Please, refer to [main Kuzzle repository](https://github.com/kuzzleio/kuzzle) for more information about running Kuzzle, filter format...

## List

* [`create`](#create)
* [`update`](#update)
* [`delete`](#delete)
* [`deleteByQuery`](#deleteByQuery)
* [`search`](#search)
* [`get`](#get)
* [`count`](#count)
* [`subscribe`](#subscribe)
* [`unsubscribe`](#unsubscribe)
* [`countSubscription`](#countSubscription)


## Definitions

<a name="create"/>
### create(collection, document, [persist, callback])

Create a new `document` for the `collection` in kuzzle.

__Arguments__

* `collection` - A string corresponding to the collection name
* `document` - An object with attributes
* `persist` - A boolean specifies if the document must be save. If true, the document is saved in Kuzzle, if not, the document is just used for real-time
* `callback(error, response)` - A function to execute when create is done with the response from Kuzzle

__Examples__

```js
// Persist a new document in the collection user
kuzzle.create("user", {username: "Grace"}, true, function(error, response) {
    if(error) {
        console.error(error);
    }

    console.log(response);
});
```

<a name="update"/>
### update(collection, document, [callback])

Update a new `document` for the `collection` in kuzzle.

__Arguments__

* `collection` - A string corresponding to the collection name
* `document` - An object with attributes. This object must contains an attribute `_id`, corresponding to document id to update.
* `callback(error, response)` - A function to execute when update is done with the response from Kuzzle

__Examples__

```js
kuzzle.update("user", {_id: "firstUserId", username: "Ada"}, function(error, response) {
    if(error) {
        console.error(error);
    }

    console.log(response);
});
```

<a name="delete"/>
### delete(collection, id, [callback])

Delete the document with `id` in the `collection` in kuzzle.

__Arguments__

* `collection` - A string corresponding to the collection name
* `id` - A string corresponding to the document `id` to delete
* `callback(error, response)` - A function to execute when delete is done with the response from Kuzzle

__Examples__

```js
kuzzle.delete("user", "firstUserId", function(error, response) {
    if(error) {
        console.error(error);
    }

    console.log(response);
});
```

<a name="deleteByQuery"/>
### deleteByQuery(collection, filters, [callback])

Delete all documents that match `filters` in the `collection` in kuzzle.

__Arguments__

* `collection` - A string corresponding to the collection name
* `filters` - An object filters. Internally we use the [Elasticsearch DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
* `callback(response)` - A function to execute when deleteByQuery is done with the response from Kuzzle. `response` contains an attribute `ids` that contains an array with all deleted ids.

__Examples__

```js
var filters = {
    "filter": {
        "term": {
            "username": "Ada"
        }
    }
}

kuzzle.deleteByQuery("user", filters, function(error, response) {
    if(error) {
        console.error(error);
    }

    console.log(response.ids);
});
```

<a name="search"/>
### search(collection, filters, [callback])

Search all documents matching `filters` for the `collection` in kuzzle.

__Arguments__

* `collection` - A string corresponding to the collection name
* `filters` - An object filters. Internally we use the [Elasticsearch DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
* `callback(error, response)` - A function to execute when search is done with the response from Kuzzle

__Examples__

```js
var filters = {
    "filter": {
        "term": {
            "username": "Ada"
        }
    }
}

// Get all "user" with "Ada" in attribute "username"
kuzzle.search("user", filters, function(error, response) {
    if(error) {
        console.error(error);
    }

    console.log("This is the document for user Ada", response.hits.hits);
});
```

```js
var data = {
    "from": 0,
    "size": 20,
    "query": {}
}

// Get all documents in "user" with a pagination
kuzzle.search("user", data, function(error, response) {
    if(error) {
        console.error(error);
    }

    console.log("First twenty documents", response.hits.hits);
});
```

```js
var data = {
  "query": {},
  "sort": "username.raw"
}

// Get all documents in "user" ordered by username
kuzzle.search("user", data, function(error, response) {
    if(error) {
        console.error(error);
    }

    console.log("User sorted by username", response.hits.hits);
});
```

**Note:** For execute a sorting, you must define a mapping before. Check [Elasticsearch documentation](https://www.elastic.co/guide/en/elasticsearch/guide/current/multi-fields.html)

<a name="get"/>
### get(collection, id, [callback])

Search a specific document by its `id` for the `collection` in kuzzle.

__Arguments__

* `collection` - A string corresponding to the collection name
* `id` - A string corresponding to the document id
* `callback(error, response)` - A function to execute when get is done with the response from Kuzzle

__Examples__

```js
kuzzle.get("user", "firstUserId", function(error, response) {
    if(error) {
        console.error(error);
    }

    console.log("This is the document for the first user", response);
});
```

<a name="count"/>
### count(collection, filters, [callback])

Count documents matching `filters` for the `collection` in kuzzle.

__Arguments__

* `collection` - A string corresponding to the collection name
* `filters` - An object filters. Internally we use the [Elasticsearch query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/1.3/query-dsl-queries.html)
* `callback(error, response)` - A function to execute when count is done with the response from Kuzzle

__Examples__

```js
var filters = {
    "query": {
        "term": {
            "username": "Ada"
        }
    }
}

kuzzle.count("user", filters, function(error, response) {
    if(error) {
        console.error(error);
    }

    console.log(response.count);
});
```

<a name="subscribe"/>
### subscribe(collection, filters, [callback])

Subscribe to a specific `filters` for the `collection` in kuzzle.
Every times an object corresponding to `filters` is created/updated/deleted, the callback is executed.

__Arguments__

* `collection` - A string corresponding to the collection name
* `filters` - An object filters. Internally we use the [Elasticsearch DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
* `callback(error, response)` - A function to execute every times we get a response from Kuzzle

__Return__

* `roomName` - A string that identify the room listening. Used to unsubscribe to this room.

__Examples__

```js
var filters = {
    "term": {
        "username": "Ada"
    }
}

// Every times a document user with username "Ada" is created/updated/deleted we'll display it in console log
kuzzle.subscribe("user", filters, function(error, response) {
    if(error) {
        console.error(error);
    }

    console.log(response);
});
```

<a name="unsubscribe"/>
### unsubscribe(roomName)

Unubscribe to a specific room. Allow to stop listening a room.

__Arguments__

* `roomName` - A string corresponding to the room to stop listening

__Examples__

```js

var global = {
    roomName: null;
}

var filters = {
    "term": {
        "username": "Ada"
    }
}

// Every times a document user with username "Ada" is created/updated/deleted we'll display it in console log
global.roomName = kuzzle.subscribe("user", filters, function(error, response) {
    if(error) {
        console.error(error);
    }

    console.log(response);
});

// This function can be executed when the user click on a button "stop to follow"
var stopListeningUsers = function() {
    kuzzle.unsubscribe(global.roomName);
}

```

<a name="countSubscription"/>
### countSubscription(roomName)

Count how many users have subscribe to a specific room.

__Arguments__

* `roomName` - A string corresponding to the room

__Examples__

```js

var global = {
    roomName: null;
}

var filters = {
    "term": {
        "username": "Ada"
    }
}

// Every times a document user with username "Ada" is created/updated/deleted we'll display it in console log
global.roomName = kuzzle.subscribe("user", filters, function(error, response) {
    if(error) {
        console.error(error);
    }

    console.log(response);
});

// Get how many user have subscribe to the same room about Ada
kuzzle.countSubscription(global.roomName, function (error, response) {
    if(error) {
        console.error(error)
    }

    console.log(response)
}

```


# License

[Apache 2](LICENSE.md)
