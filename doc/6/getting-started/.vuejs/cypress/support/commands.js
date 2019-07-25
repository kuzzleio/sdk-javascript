// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

function reinitialisation() {
  const kuzzle = Cypress.env('kuzzle');
  
  // Clear collection
  return cy.request({
    url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/${kuzzle.collection}/_truncate`,
    method: 'DELETE',
  })
    .then(searchResponse => {
      cy.log(`Request : truncate ${kuzzle.collection} status : ${searchResponse.status}`);
      cy.wait(500);
    });
}

Cypress.Commands.add('createMessage', (body) => {
  const kuzzle = Cypress.env('kuzzle');
  return cy.request({
    url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/${kuzzle.collection}/_create`,
    method: 'POST',
    body: body,
  })
    .its('body')
    .then(response => {
      cy.log(`Create status : ${response.status}`);
      cy.wait(500);
    });
});


Cypress.Commands.add('initialisation', () => {
  const kuzzle = Cypress.env('kuzzle');

  // Delete index if exists
  cy.request({
    url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/_exists`,
    method: 'GET',
  })
    .then(existsResponse => {
      cy.log(`Request : exists ${kuzzle.index} status : ${existsResponse.status}`);
      if (existsResponse.body.result) {
        cy.request({
          url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}`,
          method: 'DELETE',
        })
          .then(deleteResponse => {
            cy.log(`Request : delete ${kuzzle.index} status : ${deleteResponse.status}`);
          });
      }
    }).then(() => {
      // Create index
      cy.request({
        url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/_create`,
        method: 'POST',
      })
        .then(createResponse => {
          cy.log(`Request : create ${kuzzle.index} status : ${createResponse.status}`);
          cy.wait(500);
        });
    })
    .then(() => {
      // Create collection
      cy.request({
        url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/${kuzzle.collection}`,
        method: 'PUT',
        body: {}
      })
        .then(createResponse => {
          cy.log(`Request : create ${kuzzle.collection} status : ${createResponse.status}`);
          cy.wait(500);
        });
    });
});

Cypress.Commands.add('loadEnvironment', (env) => {
  const kuzzle = Cypress.env('kuzzle');

  reinitialisation();
  if (!env.messages) {return;}
  cy.request({
    url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/${kuzzle.collection}/_mCreate`,
    method: 'POST',
    body: {"documents": env.messages},
  })
    .its('body')
    .then(response => {
      cy.log(`mCreate status : ${response.status}`);
      cy.wait(500);
    });
});