const Bluebird = require('bluebird')
const Kuzzle = require('kuzzle-sdk')

const kuzzle = new Kuzzle('localhost', (err, resp) => {
  const documents = [
    ['gordon', 'freeman', 'blackmesa', 32, 47.41322, -1.219482],
    ['alyx', 'vance', 'city17', 26, 47.51322, -1.119482],
    ['isaac', 'kleiner', 'blackmesa', 46, 47.61322, -1.019482],
    ['eli', 'vance', 'blackmesa', 53, 47.71322, -1.319482],
    ['barney', 'calhoun', 'city17', 36, 47.81322, -1.419482],
    ['arne', 'magnusson', 'whiteforest', 54, 47.91322, -1.519482],
    ['wallace', 'breen', 'city17', 48, 48.01322, -1.619482]
  ]

  const mapping = {
    properties: {
      firstname: { type: 'text' },
      lastname: { type: 'text' },
      city: { type: 'text' },
      age: { type: 'integer' },
      location: { type: 'geo_point' },
      nested: {
        properties: {
          emplacement: {
            properties: {
              lat: { type: 'long' },
              lon: { type: 'long' }
            }
          }
        }
      }
    }
  }

  kuzzle
    .createIndexPromise('my-index')
    .catch(error => console.log(error))
    .then(() =>
      kuzzle.collection('my-collection', 'my-index').createPromise(mapping)
    )
    .catch(error => console.log(error))
    .then(() => {
      return Bluebird.map(
        documents,
        ([firstname, lastname, city, age, lat, lon]) => {
          const document = {
            firstname,
            lastname,
            city,
            age,
            location: { lat, lon },
            nested: {
              emplacement: { lat: lat + 1, lon: lon + 1 }
            }
          }
          console.log(document)

          return kuzzle
            .collection('my-collection', 'my-index')
            .createDocumentPromise(`${firstname}-${lastname}`, document)
        }
      )
    })
    .then(response => console.log(response))
    .catch(error => console.log(error))
    .finally(() => kuzzle.disconnect())
})
