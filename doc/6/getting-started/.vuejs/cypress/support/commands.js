function reinitialisation() {
  const kuzzle = Cypress.env('kuzzle');
  // Clear collection
  return cy
    .request({
      url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}`,
      method: 'DELETE',
      failOnStatusCode: false
    })
    .then(deleteResponse => {
      cy.log(`Request : delete ${kuzzle.index} status : ${deleteResponse.status}`);
      cy.wait(2000);
      // Create index
    });
}

Cypress.Commands.add('createMessage', (body) => {
  const kuzzle = Cypress.env('kuzzle');
  return cy
    .request({
      url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/${kuzzle.collection}/_create`,
      method: 'POST',
      body: body,
    })
    .its('body')
    .then(response => {
      cy.log(`Create status : ${response.status} {${body.username} / ${body.value}}`);
      cy.wait(500);
    });
});

Cypress.Commands.add('initialisation', () => {
  const kuzzle = Cypress.env('kuzzle');
  // Delete index if exists
  return cy
    .request({
      url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}`,
      method: 'DELETE',
      failOnStatusCode: false
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
    });
});

Cypress.Commands.add('loadEnvironment', (env) => {
  const kuzzle = Cypress.env('kuzzle');
  if (!env.messages) {
    return reinitialisation();
  } else {
    return cy
      .initialisation()
      .then(() => {
        return cy
          .request({
            url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/${kuzzle.collection}/_mCreate`,
            method: 'POST',
            body: { "documents": env.messages },
          })
      })
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
      });
  }
});