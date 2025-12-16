Feature: Realtime subscription

  Scenario: Receive notifications when a document is created
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And I subscribe to 'test-collection'
    When I create a document in 'test-collection'
    Then I receive a notification

  Scenario: Receive notifications when a document is updated
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And the collection has a document with id 'my-document-id'
    And I subscribe to 'test-collection' with '{"equals": {"foo": "barz"}}' as filter
    When I update the document with id 'my-document-id' and content 'foo' = 'barz'
    Then I receive a notification

  Scenario: Receive notifications when a document is deleted
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And the collection has a document with id 'my-document-id'
    And I subscribe to 'test-collection'
    When I delete the document with id 'my-document-id'
    Then I receive a notification

  Scenario: Receive notifications when a document is published
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And I subscribe to 'test-collection'
    When I publish a document
    Then I receive a notification

  Scenario: Stop receiving notification when I unsubscribe
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And the collection has a document with id 'my-document-id'
    And I subscribe to 'test-collection'
    And I unsubscribe
    When I publish a document
    Then I do not receive a notification
