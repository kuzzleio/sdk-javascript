Feature: Document management

  Scenario: Do not allow creating a document with an _id that already exist in the same collection
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And the collection has a document with id 'my-document-id'
    When I create a document with id 'my-document-id'
    Then I get an error with message 'Document already exists.'

  Scenario: Create a document with create
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And the collection doesn't have a document with id 'my-document-id'
    When I create a document with id 'my-document-id'
    Then the document is successfully created

  Scenario: Create a document with createOrReplace if it does not exists
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And the collection doesn't have a document with id 'my-document-id'
    When I createOrReplace a document with id 'my-document-id'
    Then the document is successfully created

  Scenario: Replace a document if it exists
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    When I createOrReplace a document with id 'my-document-id'
    Then the document is successfully replaced

  Scenario: Replace a document
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And the collection has a document with id 'replace-my-document-id'
    When I replace a document with id 'replace-my-document-id'
    Then the document is successfully replaced

  Scenario: Delete a document
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And the collection has a document with id 'delete-my-document-id'
    When I delete the document with id 'delete-my-document-id'
    Then the document is successfully deleted

  Scenario: Update a document
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And the collection has a document with id 'update-my-document-id'
    When I update a document with id 'update-my-document-id'
    Then the document is successfully updated

  Scenario: Search a document by id and find it
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And the collection has a document with id 'search-my-document-id'
    When I search a document with id 'search-my-document-id'
    Then the document is successfully found

  Scenario: Search a document by id and don't find it
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And the collection has a document with id 'search-my-document-id'
    When I search a document with id 'fake-id'
    Then the document is not found

  Scenario: Search documents by query
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And I truncate the collection 'test-collection'
    And the collection has a document with id 'search-my-document-id1'
    And the collection has a document with id 'search-my-document-id2'
    And the collection has a document with id 'search-my-document-id3'
    And the collection has a document with id 'search-my-document-id4'
    And the collection has a document with id 'search-my-document-id5'
    When I search documents matching '{}' with from 0 and size 2
    Then The search result should have a total of 5 documents
    And The search result should have fetched 2 documents

  Scenario: Search next documents
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'test-collection'
    And I truncate the collection 'test-collection'
    And the collection has a document with id 'search-my-document-id1'
    And the collection has a document with id 'search-my-document-id2'
    And the collection has a document with id 'search-my-document-id3'
    And the collection has a document with id 'search-my-document-id4'
    And the collection has a document with id 'search-my-document-id5'
    When I search documents matching '{}' with from 0 and size 2
    And I search the next documents
    Then The search result should have a total of 5 documents
    And The search result should have fetched 4 documents

  Scenario: Count documents in a collection
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'count-test-collection'
    And the collection has a document with id 'count-my-document-id'
    And the collection has a document with id 'count-my-document-id2'
    And the collection has a document with id 'count-my-document-id3'
    When I count how many documents there is in the collection
    Then I shall receive 3

  Scenario: Delete multiple documents with no error
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'delete-test-collection'
    And the collection has a document with id 'mdelete-my-document-id'
    And the collection has a document with id 'mdelete-my-document-id2'
    When I delete the documents ['mdelete-my-document-id', 'mdelete-my-document-id2']
    Then I must have 0 documents in the collection

  Scenario: Delete multiple documents with partial error
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'mdelete-test-collection'
    And the collection has a document with id 'mdelete-my-document-id'
    And the collection has a document with id 'mdelete-my-document-id2'
    When I delete the documents ['mdelete-my-document-id', 'mdelete-my-document-unknown']
    Then I must have 1 documents in the collection
    And I get an error in the errors array

  Scenario: Create multiple documents with no error
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'mcreate-test-collection'
    And the collection doesn't have a document with id 'mcreate-my-document-id'
    And the collection doesn't have a document with id 'mcreate-my-document-id2'
    When I create the documents ['mcreate-my-document-id', 'mcreate-my-document-id2']
    Then I must have 2 documents in the collection
    And I should have no errors in the errors array

  Scenario: Create multiple documents with partial error
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'mcreate-test-collection'
    And the collection has a document with id 'mcreate-my-document-id'
    When I create the documents ['mcreate-my-document-id', 'mcreate-my-document-id2']
    Then I must have 2 documents in the collection
    And I get an error in the errors array

  Scenario: Replace multiple documents with no error
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'mreplace-test-collection'
    And the collection has a document with id 'mreplace-my-document-id'
    And the collection has a document with id 'mreplace-my-document-id2'
    When I replace the documents ['mreplace-my-document-id', 'mreplace-my-document-id2']
    Then I should have no errors in the errors array
    And the document 'mreplace-my-document-id' should be replaced
    And the document 'mreplace-my-document-id2' should be replaced

  Scenario: Replace multiple documents with partial error
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'mreplace-test-collection'
    And the collection has a document with id 'mreplace-my-document-id'
    And the collection has a document with id 'mreplace-my-document-id2'
    When I replace the documents ['unknown', 'mreplace-my-document-id2']
    And the document 'mreplace-my-document-id2' should be replaced
    And I get an error in the errors array

  Scenario: Update multiple documents with no error
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'mreplace-test-collection'
    And the collection has a document with id 'mreplace-my-document-id'
    And the collection has a document with id 'mreplace-my-document-id2'
    When I update the documents ['mreplace-my-document-id', 'mreplace-my-document-id2']
    Then I should have no errors in the errors array
    And the document 'mreplace-my-document-id' should be replaced
    And the document 'mreplace-my-document-id2' should be replaced

  Scenario: Update multiple documents with partial error
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'mupdate-test-collection'
    And the collection has a document with id 'mupdate-my-document-id'
    And the collection has a document with id 'mupdate-my-document-id2'
    When I update the documents ['unknown', 'mupdate-my-document-id2']
    Then the document 'mupdate-my-document-id2' should be updated
    And I get an error in the errors array

  Scenario: CreateOrReplace (create) multiple documents with no error
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'mcreateorreplace-test-collection'
    When I createOrReplace the documents ['mcreateorreplace-my-document-id', 'mcreateorreplace-my-document-id2']
    Then I should have no errors in the errors array
    And the document 'mcreateorreplace-my-document-id' should be created
    And the document 'mcreateorreplace-my-document-id2' should be created

  Scenario: CreateOrReplace (replace) multiple documents with no error
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'mcreateorreplace-test-collection'
    And the collection has a document with id 'mcreateorreplace-my-document-id'
    And the collection has a document with id 'mcreateorreplace-my-document-id2'
    When I createOrReplace the documents ['mcreateorreplace-my-document-id', 'mcreateorreplace-my-document-id2']
    Then I should have no errors in the errors array
    And the document 'mcreateorreplace-my-document-id' should be replaced
    And the document 'mcreateorreplace-my-document-id2' should be replaced

  Scenario: Check if a document exists
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'exist-test-collection'
    And the collection has a document with id 'exist-my-document-id'
    When I check if 'exist-my-document-id' exists
    Then the document should exist

  Scenario: Check if a document does not exists
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'exist-test-collection'
    And the collection has a document with id 'exist-my-document-id'
    When I check if 'exist-my-document-unknown' exists
    Then the document should not exist

  Scenario: Get multiple document
    Given Kuzzle Server is running
    And there is an index 'test-index'
    And it has a collection 'mget-test-collection'
    And the collection has a document with id 'mget-my-document-id'
    And the collection has a document with id 'mget-my-document-id2'
    When I get documents ['mget-my-document-id', 'mget-my-document-id2']
    Then the documents should be retrieved
