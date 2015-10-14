Kuzzle
======

## About Kuzzle

For UI and linked objects developers, Kuzzle is an open-source solution that handles all the data management (CRUD, real-time storage, search, high-level features, etc).

You can access the Kuzzle repository here: https://github.com/kuzzleio/kuzzle

## Installation

### NodeJS

```
npm install kuzzle-sdk --save
```

#### Basic usage

```javascript
var
  Kuzzle = require('kuzzle-sdk'),
  kuzzle = new Kuzzle('http://foobar:7512');

var myDoc = {
  name: 'Rick Astley',
  birthDate: '1966/02/06',
  mainActivity: 'Singer',
  website: 'http://www.rickastley.co.uk',
  comment: 'Never gonna give you up, never gonna let you down'
};

kuzzle
  .dataCollectionFactory('people')
  .create(myDoc, {persist: true}, function(error, response) {
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

There are promise-based methods for all Kuzzle method allowing a callback. Just suffix those methods with ```Async```.

Here is the above example, using promises:

```javascript
var
  Kuzzle = require('kuzzle-sdk'),
  kuzzle = new Kuzzle('http://foobar:7512');

var myDoc = {
  name: 'Rick Astley',
  birthDate: '1966/02/06',
  mainActivity: 'Singer',
  website: 'http://www.rickastley.co.uk',
  comment: 'Never gonna give you up, never gonna let you down'
};

kuzzle
  .dataCollectionFactory('people')
  .createAsync(myDoc, {persist: true})
  .then(function (response) {
    /*
    response should contain :
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
  .catch(function (error) {
    // handle error here
  });
});
```

### HTML

#### Vanilla

Download the file [kuzzle.min.js](kuzzle.min.js) at TODO: COMPLETE_URL and the following to your HTML file:

```html
<script type="text/javascript" src="path/to/kuzzle.min.js"></script>
```

You are now ready to use Kuzzle:

```javascript
var
  kuzzle = new Kuzzle('http://foobar:7512');

var myDoc = {
  name: 'Rick Astley',
  birthDate: '1966/02/06',
  mainActivity: 'Singer',
  website: 'http://www.rickastley.co.uk',
  comment: 'Never gonna give you up, never gonna let you down'
};

kuzzle
  .dataCollectionFactory('people')
  .create(myDoc, {persist: true}, function(error, response) {
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

## SDK Documentation

Complete SDK documentation available here: http://kuzzleio.github.io/sdk-documentation

# License

[Apache 2](LICENSE.md)
