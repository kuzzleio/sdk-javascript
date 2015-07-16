# About Kuzzle

For UI and linked objects developers, Kuzzle is an open-source solution that handles all the data management (CRUD, real-time storage, search, high-level features, etc).

[You can access to the Kuzzle repository here](https://github.com/kuzzleio/kuzzle)

# How to use this javascript sdk ?

* Download the file kuzzle.min.js at COMPLETE_URL
* Add to your HTML file those lines:

    ```
    <script src="https://cdn.socket.io/socket.io-1.3.4.js"></script>
    <script type="text/javascript" src="path/to/kuzzle.min.js"></script>
    ```
    
You are now ready for:

```
// Init kuzzle object
var kuzzle = new Kuzzle('http://localhost:8081');

// Create a new user
kuzzle.create("user", {username: "Grace"}, true);

// Subscribe to collection user and be notified when a user with username 'Ada' is saved
kuzzle.subscribe('user', {term: {username: 'Ada'}}, function (data) {
    console.log(data);
});
```

# API

## Note

Please, refer to [main Kuzzle repository](https://github.com/kuzzleio/kuzzle) for more information about running Kuzzle, filter format, ...

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


## Definitions

<a names="create"/>
### create(collection, document, [persist, callback])

Create a new `document` for the `collection` in kuzzle.

__Arguments__

* `collection` - A string corresponding to the collection name
* `document` - An object with attributes
* `persist` - A boolean specifies if the document must be save. If true, the document is saved in Kuzzle, if not, the document is just used for real-time
* `callback(response)` - A function to execute when create is done with the response from Kuzzle

__Examples__

```js
// Persist a new document in the collection user
kuzzle.create("user", {username: "Grace"}, true, function(response) {
    if(response.error) {
        console.error(response.error);
    }
        
    console.log(response);
});
```

<a names="update"/>
### update(collection, document, [callback])

Update a new `document` for the `collection` in kuzzle.

__Arguments__

* `collection` - A string corresponding to the collection name
* `document` - An object with attributes. This object must contains an attribute `_id`, corresponding to document id to update.
* `callback(response)` - A function to execute when update is done with the response from Kuzzle

__Examples__

```js
kuzzle.update("user", {_id: "firstUserId", username: "Ada"}, function(response) {
    if(response.error) {
        console.error(response.error);
    }
    
    console.log(response);
});
```

<a names="delete"/>
### delete(collection, id, [callback])

Delete the document with `id` in the `collection` in kuzzle.

__Arguments__

* `collection` - A string corresponding to the collection name
* `id` - A string corresponding to the document `id` to delete
* `callback(response)` - A function to execute when delete is done with the response from Kuzzle

__Examples__

```js
kuzzle.delete("user", "firstUserId", function(response) {
    if(response.error) {
        console.error(response.error);
    }
    
    console.log(response.result);
});
```

<a names="deleteByQuery"/>
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

kuzzle.deleteByQuery("user", filters, function(response) {
    if(response.error) {
        console.error(response.error);
    }
    
    console.log(response.result.ids);
});
```

<a names="search"/>
### search(collection, filters, [callback])

Search all documents matching `filters` for the `collection` in kuzzle.

__Arguments__

* `collection` - A string corresponding to the collection name
* `filters` - An object filters. Internally we use the [Elasticsearch DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
* `callback(response)` - A function to execute when search is done with the response from Kuzzle

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
kuzzle.search("user", filters, function(response) {
    if(response.error) {
        console.error(response.error);
    }
    
    console.log("This is the document for user Ada", response.result.hits.hits);
});
```

```js
var data = {
    "from": 0,
    "size": 20,
    "query": {}
}

// Get all documents in "user" with a pagination
kuzzle.search("user", data, function(response) {
    if(response.error) {
        console.error(response.error);
    }
    
    console.log("First twenty documents", response.result.hits.hits);
});
```

```js
var data = {
  "query": {},
  "sort": "username.raw"
}

// Get all documents in "user" ordered by username with a pagination
kuzzle.search("user", data, function(response) {
    if(response.error) {
        console.error(response.error);
    }
    
    console.log("First twenty documents", response.result.hits.hits);
});
```
** Note:** For execute a sorting, you must define a mapping before. Check [Elasticsearch documentation](https://www.elastic.co/guide/en/elasticsearch/guide/current/multi-fields.html)

<a names="get"/>
### get(collection, id, [callback])

Search a specific document by its `id` for the `collection` in kuzzle.

__Arguments__

* `collection` - A string corresponding to the collection name
* `id` - A string corresponding to the document id
* `callback(response)` - A function to execute when get is done with the response from Kuzzle

__Examples__

```js
kuzzle.get("user", "firstUserId", function(response) {
    if(response.error) {
        console.error(response.error);
    }
    
    console.log("This is the document for the first user", response.result);
});
```

<a names="count"/>
### count(collection, filters, [callback])

Count documents matching `filters` for the `collection` in kuzzle.

__Arguments__

* `collection` - A string corresponding to the collection name
* `filters` - An object filters. Internally we use the [Elasticsearch query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/1.3/query-dsl-queries.html)
* `callback(response)` - A function to execute when count is done with the response from Kuzzle

__Examples__

```js
var filters = {
    "query": {
        "term": {
            "username": "Ada"
        }
    }
}

kuzzle.count("user", filters, function(response) {
    if(response.error) {
        console.error(response.error);
    }
    
    console.log(response.result.count);
});
```

<a names="subscribe"/>
### subscribe(collection, filters, [callback])

Subscribe to a specific `filters` for the `collection` in kuzzle.
Every times an object corresponding to `filters` is created/updated/deleted, the callback is executed.

__Arguments__

* `collection` - A string corresponding to the collection name
* `filters` - An object filters. Internally we use the [Elasticsearch DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
* `callback(response)` - A function to execute every times we get a response from Kuzzle

__Return__

* `roomId` - A string that identify the room listening. Used for unsubscribe to this room.

__Examples__

```js
var filters = {
    "term": {
        "username": "Ada"
    }
}

// Every times a document user with username "Ada" is created/updated/deleted we'll display it in console log
kuzzle.subscribe("user", filters, function(response) {
    if(response.error) {
        console.error(response.error);
    }
    
    console.log(response);
});
```

<a names="unsubscribe"/>
### unsubscribe(roomId)

Unubscribe to a specific room. Allow to stop listening a room.

__Arguments__

* `roomId` - A string corresponding to the room to stop listening

__Examples__

```js

var global = {
    roomId: null;
}

var filters = {
    "term": {
        "username": "Ada"
    }
}

// Every times a document user with username "Ada" is created/updated/deleted we'll display it in console log
global.roomId = kuzzle.subscribe("user", filters, function(response) {
    if(response.error) {
        console.error(response.error);
    }
    
    console.log(response);
});

// This function can be executed when the user click on a button "stop to follow"
var stopListeningUsers = function() {
    kuzzle.unsubscribe(global.roomId);
}

```


# License

See [License](LICENSE.md)
