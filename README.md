Kuzzle
======

## About Kuzzle

For UI and linked objects developers, Kuzzle is an open-source solution that handles all the data management (CRUD, real-time storage, search, high-level features, etc).

You can access the Kuzzle repository here: https://github.com/kuzzleio/kuzzle


## SDK Documentation

The complete SDK documentation is available here: http://kuzzleio.github.io/sdk-documentation

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
  .createDocument(myDoc, function(error, response) {
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

There are promise-based methods for all Kuzzle method allowing a callback. Just suffix those methods with ```Promise```.

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
  .createDocumentPromise(myDoc)
  .then(response => {
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
  .catch(error => {
    // handle error here
  });
});
```

### HTML

#### Vanilla

Download the file [kuzzle.min.js](./browser/kuzzle.min.js) available in the ``browser`` directory of this project.

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
  .createDocument(myDoc, function(error, response) {
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

# License

[Apache 2](LICENSE.md)
