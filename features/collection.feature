Feature: Collection management

  Scenario: Create a collection
    Given Kuzzle Server is running
    And there is an index 'test-index'
    When I create a collection 'collection-test-collection'
    Then the collection 'collection-test-collection' should exist

  Scenario: Check if a collection exists
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    When I check if the collection 'test-collection' exists
    Then the collection should exist

  Scenario: List existing collections
    Given Kuzzle Server is running
    And there is an index 'list-test-index'
    And it has a collection 'test-collection1'
    And it has a collection 'test-collection2'
    When I list the collections of 'list-test-index'
    Then the result contains 2 hits
    And the content should not be null

  Scenario: Truncate a collection
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And the collection has a document with id 'my-document-id'
    And the collection has a document with id 'my-document-id2'
    When I truncate the collection 'test-collection'
    Then the collection 'test-collection' should be empty

  Scenario: Create a collection with a custom mapping
    Given Kuzzle Server is running
    And there is an index 'test-index'
    When I create a collection 'test-create-with-mapping' with a mapping
    Then the collection 'test-create-with-mapping' should exist
    And the mapping of 'test-create-with-mapping' should be updated

  Scenario: Update a collection with a custom mapping
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    When I update the mapping of collection 'test-collection'
    Then the mapping of 'test-collection' should be updated

  Scenario: Update specifications
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    When I update the specifications of the collection 'test-collection'
    Then the specifications of 'test-collection' should be updated

  Scenario: Validate specifications
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    When I validate the specifications of 'test-collection'
    Then they should be validated

  Scenario: Delete specifications
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And has specifications
    When I delete the specifications of 'test-collection'
    Then the specifications of 'test-collection' must not exist
