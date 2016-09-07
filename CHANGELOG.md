*__note:__ the # at the end of lines are the pull request numbers on GitHub*

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
