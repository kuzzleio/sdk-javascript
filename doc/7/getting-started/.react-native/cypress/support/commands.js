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
        cy.log(`Create status : ${response.status} {${body.author} / ${body.message}}`);
        cy.wait(500);
      });
  });
  
  Cypress.Commands.add('initialisation', () => {
    const kuzzle = Cypress.env('kuzzle');
    // check if index exists
    return cy
      .request({
        url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/_exists`,
        method: 'GET'
      })
      .then(existsResponse => {
        cy.wait(1000)
        cy.log(`Request : exists ${kuzzle.index} status : ${existsResponse.status}`);
        // Reset collection
        if (existsResponse.result) {
          return cy
          .request({
            url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/${kuzzle.collection}/_truncate`,
            method: 'DELETE'
          })
        }
        return;
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
              url: `http://${kuzzle.host}:${kuzzle.port}/${kuzzle.index}/${kuzzle.collection}/_refresh`,
              method: 'POST',
            })
        })
        .then((response) => {
          cy.log(`refresh status : ${response.status}`);
          cy.wait(500);
        });
    }
  });