function reinitialisation() {
  const kuzzle = Cypress.env('kuzzle');
  // Clear collection
  cy
    .request({
      url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/${kuzzle.collection}/_truncate`,
      method: 'DELETE',
    })
    .then(searchResponse => {
      cy.log(`Request : truncate ${kuzzle.collection} status : ${searchResponse.status}`);
      cy.wait(500);
    })
    .catch(error => {
      cy.log(`ERROR: ${error.message}`);
    });
}

Cypress.Commands.add('createMessage', (body) => {
  const kuzzle = Cypress.env('kuzzle');
  cy
    .request({
      url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/${kuzzle.collection}/_create`,
      method: 'POST',
      body: body,
    })
    .its('body')
    .then(response => {
      cy.log(`Create status : ${response.status} {${body.username} / ${body.value}}`);
      cy.wait(500);
    })
    .catch(error => {
      cy.log(`ERROR: ${error.message}`);
    });
});

Cypress.Commands.add('initialisation', () => {
  const kuzzle = Cypress.env('kuzzle');
  // Delete index if exists
  cy
    .request({
      url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/_exists`,
      method: 'GET',
    })
    .then(existsResponse => {
      cy.log(`Request : exists ${kuzzle.index} status : ${existsResponse.status}`);
      if (existsResponse.body.result) {
        return cy
          .request({
            url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}`,
            method: 'DELETE',
          });
      } else {
        throw new Error();
      }
    })
    .then(deleteResponse => {
      cy.log(`Request : delete ${kuzzle.index} status : ${deleteResponse.status}`);
      // Create index
      return cy
        .request({
          url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/_create`,
          method: 'POST',
        })
    })
    .then(createIndexResponse => {
      cy.log(`Request : create ${kuzzle.index} status : ${createIndexResponse.status}`);
      cy.wait(500);
      // Create collection
      return cy
        .request({
          url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/${kuzzle.collection}`,
          method: 'PUT',
          body: {}
        })
    })
    .then(createCollectionResponse => {
      cy.log(`Request : create ${kuzzle.collection} status : ${createCollectionResponse.status}`);
      cy.wait(500);
    })
    .catch( error => {
      cy.log(`ERROR: ${error.message}`);
    })
});

Cypress.Commands.add('loadEnvironment', (env) => {
  const kuzzle = Cypress.env('kuzzle');
  reinitialisation();
  if (!env.messages) { return; }
  cy
    .request({
      url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/${kuzzle.collection}/_mCreate`,
      method: 'POST',
      body: { "documents": env.messages },
    })
    .its('body')
    .then(response => {
      cy.log(`mCreate status : ${response.status}`);
      cy.wait(500);
      return cy
        .request({
          url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/_refresh`,
          method: 'POST',
        })
    })
    .then((response) => {
      cy.log(`refresh status : ${response.status}`);
      cy.wait(500);
    })
    .catch(error => {
      cy.log(`ERROR: ${error.message}`);
    });
});