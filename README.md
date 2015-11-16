[![Build Status](https://travis-ci.org/kuzzleio/sdk-javascript.svg?branch=master)](https://travis-ci.org/kuzzleio/sdk-javascript) [![Dependency Status](https://david-dm.org/kuzzleio/sdk-javascript.svg)](https://david-dm.org/kuzzleio/sdk-javascript)


Kuzzle
======

## About Kuzzle

For UI and linked objects developers, Kuzzle is an open-source solution that handles all the data management (CRUD, real-time storage, search, high-level features, etc).

You can access the Kuzzle repository on [Github](https://github.com/kuzzleio/kuzzle)


## SDK Documentation

The complete SDK documentation is available [here](http://kuzzleio.github.io/sdk-documentation)

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
    'response' is a KuzzleDocument object
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
    'response' is a KuzzleDocument object
    */
  })
  .catch(error => {
    // handle error here
  });
});
```

### HTML

#### Vanilla

Download the file [kuzzle.min.js](https://raw.githubusercontent.com/kuzzleio/sdk-javascript/browser/kuzzle.min.js) available in the [browser](https://github.com/kuzzleio/sdk-javascript/tree/browser) branch of this project.

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
    'response' is a KuzzleDocument object
    */
});
```

# License

[Apache 2](LICENSE.md)
