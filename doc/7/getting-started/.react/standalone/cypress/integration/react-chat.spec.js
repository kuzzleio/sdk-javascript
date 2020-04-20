describe('test realtime chat', () => {

  it('should enter a nickname', function () {
    cy.fixture(`Elrond.json`).as('fixt')
      .then(() => cy.loadEnvironment(this.fixt))
      .then(() => cy.wait(2000))
      .then(() => {
        cy.visit('/');
        cy.get('#message')
          .should('not.exist');

        cy.get('#username')
          .type(this.fixt.username);

        cy.contains('Valid')
          .click();

        cy.get('#message')
          .should('exist');
        cy.get('#username')
          .should('not.exist');
      });
  });

  it('should fetch and display some messages', function () {
    cy.fixture(`Legolas.json`).as('fixt')
      .then(() => cy.loadEnvironment(this.fixt))
      .then(() => cy.wait(2000))
      .then(() => {
        cy.visit('/');
        cy.get('#username')
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
      .then(() => cy.wait(2000))
      .then(() => {
        cy.visit('/');
        cy.get('#username')
          .type(this.fixt.username);
        cy.contains('Valid')
          .click();
        cy.get('#message')
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
      .then(() => cy.wait(2000))
      .then(() => {
        cy.visit('/');
        cy.get('#username')
          .type(this.fixt.username);
        cy.contains('Valid')
          .click();
        cy.wait(2000)
        cy.createMessage(this.fixt.body);
        cy.get('.fromOthers')
          .within(() => {
            cy.contains(this.fixt.body.value);
            cy.contains(this.fixt.body.username);
          });
      });
  });
});