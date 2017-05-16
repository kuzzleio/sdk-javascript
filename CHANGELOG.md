# [4.0.1](https://github.com/kuzzleio/sdk-javascript/releases/tag/4.0.1) (2017-05-9)

[Full Changelog](https://github.com/kuzzleio/sdk-javascript/compare/4.0.1...4.0.1)

### Compatibility

| Kuzzle | Proxy |
|--------|-------|
| 1.0.0-RC10 | 1.0.0-RC10 |

#### Enhancements

- [ [#200](https://github.com/kuzzleio/sdk-javascript/pull/200) ] Add kuzzle info in Document object   ([AnthonySendra](https://github.com/AnthonySendra))

# [4.0.0](https://github.com/kuzzleio/sdk-javascript/releases/tag/4.0.0) (2017-04-10)

[Full Changelog](https://github.com/kuzzleio/sdk-javascript/compare/4.0.0...4.0.0)

### Compatibility

| Kuzzle | Proxy |
|--------|-------|
| 1.0.0-RC9.6 | 1.0.0-RC9 |

#### Breaking changes

- [ [#201](https://github.com/kuzzleio/sdk-javascript/pull/201) ] Rename metadata into volatile   ([AnthonySendra](https://github.com/AnthonySendra))

#### Bug fixes

- [ [#194](https://github.com/kuzzleio/sdk-javascript/pull/194) ] Stop calling onClientError when disconnect is called   ([jenow](https://github.com/jenow))
- [ [#193](https://github.com/kuzzleio/sdk-javascript/pull/193) ] Wrap filter in query for deleteDocument   ([jenow](https://github.com/jenow))

#### Enhancements

- [ [#199](https://github.com/kuzzleio/sdk-javascript/pull/199) ] Add support for the new retryOnConflict option   ([scottinet](https://github.com/scottinet))
- [ [#191](https://github.com/kuzzleio/sdk-javascript/pull/191) ] Standardize memory storage object   ([scottinet](https://github.com/scottinet))

#### Exclude

- [ [#196](https://github.com/kuzzleio/sdk-javascript/pull/196) ] Fix ms.hgetall return value interpretation   ([scottinet](https://github.com/scottinet))
- [ [#198](https://github.com/kuzzleio/sdk-javascript/pull/198) ] Fix ms.zscore return value type   ([scottinet](https://github.com/scottinet))

#### Others

- [ [#195](https://github.com/kuzzleio/sdk-javascript/pull/195) ] Moved bufferutil and utf-8-validate to peerDependencies   ([jenow](https://github.com/jenow))
- [ [#190](https://github.com/kuzzleio/sdk-javascript/pull/190) ] Align SearchResult and scroll with other SDKs   ([dbengsch](https://github.com/dbengsch))
- [ [#182](https://github.com/kuzzleio/sdk-javascript/pull/182) ] Collection.createDocument: rename the updateIfExist option   ([scottinet](https://github.com/scottinet))
- [ [#188](https://github.com/kuzzleio/sdk-javascript/pull/188) ] Make all options given to kuzzle constructor writable   ([benoitvidis](https://github.com/benoitvidis))
- [ [#177](https://github.com/kuzzleio/sdk-javascript/pull/177) ] Remove previous and next cache in SearchResult   ([dbengsch](https://github.com/dbengsch))
- [ [#177](https://github.com/kuzzleio/sdk-javascript/pull/177) ] Remove previous and next cache in SearchResult   ([dbengsch](https://github.com/dbengsch))
- [ [#184](https://github.com/kuzzleio/sdk-javascript/pull/184) ] Browsers compatibility fix   ([scottinet](https://github.com/scottinet))

---

# 3.4.0

Fill changes list: https://github.com/kuzzleio/sdk-javascript/releases/tag/3.4.0

# 3.1.0

* Fill changes list: https://github.com/kuzzleio/sdk-javascript/releases/tag/3.1.0

## Breaking Changes

* Align notification responses format #147

# 2.2.0

* https://github.com/kuzzleio/sdk-javascript/releases/tag/2.2.0

# 2.1.5

* Hotfixed a bug when recovering from a websocket connection error created an exponential number of clients #122

# 2.1.4

* https://github.com/kuzzleio/sdk-javascript/releases/tag/2.1.4

# 2.1.3

* https://github.com/kuzzleio/sdk-javascript/releases/tag/2.1.3

# 2.1.2

* https://github.com/kuzzleio/sdk-javascript/releases/tag/2.1.2

# 2.1.0

* Full changes list: https://github.com/kuzzleio/sdk-javascript/releases/tag/2.1.0

## Breaking Changes

* `KuzzleDataCollection` constructor signature has been changed from:  
`KuzzleDataCollection(kuzzle, index, collection)`  
 to:  
`KuzzleDataCollection(kuzzle, collection, index)`  
This has been done to make it on par with the `Kuzzle.dataCollectionFactory` method #109
* Subscription changes: #112
  * `KuzzleDataCollection.subscribe` and `KuzzleDocument.subscribe` now both return an object containing an `onDone` method, allowing to chain callback registrations. These callbacks are called once the subscription is done, with the following arguments: `callback(error, kuzzleRoomObject)`. 
  * `KuzzleRoom.renew` now accepts an optional callback as its last argument. This callback is invoked with the subscription result (the first callback argument is still only invoked whenever a notification is received)


# 2.0.3

* https://github.com/kuzzleio/sdk-javascript/releases/tag/2.0.3

# 2.0.2

* https://github.com/kuzzleio/sdk-javascript/releases/tag/2.0.2

# 2.0.0

* https://github.com/kuzzleio/sdk-javascript/releases/tag/2.0.0

# 1.9.2

* Reinforce unit tests on the `security.getProfile` method #94
* Remove jshint as it overlapped with eslint #93
* Fix #95: handle empty mappings #96

# 1.9.1

* Fix issue #91

# 1.9.0

## Features
* Implement new roles functionalities (`KuzzleSecurity.isActionAllowed`, `KuzzleSecurity.getMyRights`, `KuzzleSecurity.getUserRights`)
* Implement the elasticsearch autorefresh features (`Kuzzle.refreshIndex`, `Kuzzle.getAutoRefresh`, `Kuzzle.setAutoRefresh`)
* Implement the `Kuzzle.updateSelf` method that allow to update current user
* Fix issues #81, #82, #73 & #76

## List of merged PR
* Merge pull request #88 from kuzzleio/KUZ-574-getRights-methods - _Sébastien Cottinet_
* Merge pull request #90 from kuzzleio/rename-policies - _Kévin Blondel_
* Merge pull request #85 from kuzzleio/fix-rc-83-update-and-delete-consistency - _Sébastien Cottinet_
* Merge pull request #87 from kuzzleio/KUZ-480-isActionAllowed - _Sébastien Cottinet_
* Merge pull request #86 from kuzzleio/fix-rc-81-refactor-factory-signature - _Kévin Blondel_
* Merge pull request #84 from kuzzleio/fix-rc-73-paginate-fetchAll - _Sébastien Cottinet_
* Merge pull request #83 from kuzzleio/fix-rc-76-secure-dataCollectionFactory - _Kévin Blondel_
* Merge pull request #80 from kuzzleio/kuz-463-es-autorefresh - _Sébastien Cottinet_
