describe('test realtime chat', () => {

  before(() => {
    cy.initialisation();
  });

  it('should enter a nickname', function () {
    cy.fixture(`Elrond.json`).as('fixt')
      .then(() => cy.loadEnvironment(this.fixt))
      .then(() => {
        cy.visit('/');
        cy.get('[placeholder="Enter your message"]')
          .should('not.exist');

        cy.get('[placeholder="Enter your nickname"]')
          .type(this.fixt.username);

        cy.contains('Valid')
          .click();

        cy.get('[placeholder="Enter your message"]')
          .should('exist');
        cy.get('[placeholder="Enter your nickname"]')
          .should('not.exist');
      });
  });

  it('should fetch and display some messages', function () {
    cy.fixture(`Legolas.json`).as('fixt')
      .then(() => cy.loadEnvironment(this.fixt))
      .then(() => {
        cy.visit('/');
        cy.get('[placeholder="Enter your nickname"]')
          .type(this.fixt.username);
        cy.contains('Valid')
          .click();
        for (const message of this.fixt.messages) {
          cy.get(message.body.username === this.fixt.username ? '.fromMe' : '.fromOthers')
            .within(() => {
              cy.contains(message.body.username);
              cy.contains(message.body.value);
            });
        }
      });
  });

  it('should send a message', function () {
    cy.fixture(`Sam.json`).as('fixt')
      .then(() => cy.loadEnvironment(this.fixt))
      .then(() => {
        cy.visit('/');
        cy.get('[placeholder="Enter your nickname"]')
          .type(this.fixt.username);
        cy.contains('Valid')
          .click();
        cy.get('[placeholder="Enter your message"]')
        .type(this.fixt.body.value);
        cy.contains('Send')
        .click();
        cy.get('.fromMe')
          .within(() => {
            cy.contains(this.fixt.body.value);
            cy.contains(this.fixt.body.username);
          });
      });
  });

  it('should receive a message', function () {
    cy.fixture(`Sauron.json`).as('fixt')
      .then(() => cy.loadEnvironment(this.fixt))
      .then(() => {
        cy.visit('/');
        cy.get('[placeholder="Enter your nickname"]')
          .type(this.fixt.username);
        cy.contains('Valid')
          .click();
        cy.createMessage(this.fixt.body);

        cy.get('.fromOthers')
          .within(() => {
            cy.contains(this.fixt.body.value);
            cy.contains(this.fixt.body.username);
          });
      });
  });
});