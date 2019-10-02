describe('test realtime chat', () => {

  before(() => {
    cy.initialisation();
  });
  
  it('should fetch and display some messages', function () {
    cy.fixture('Legolas.json').as('fixt')
      .then(() => cy.loadEnvironment(this.fixt))
      .then(() => cy.wait(2000))
      .then(() => {
        cy.log(this.fixt);
        cy.visit('/');
        for (const message of this.fixt.messages) {
          cy.contains(message.body.text);
        }
      });
  });
  
  it('should send a message', function () {
    cy.fixture('Sam.json').as('fixt')
      .then(() => cy.loadEnvironment(this.fixt))
      .then(() => cy.wait(2000))
      .then(() => {
        cy.visit('/');
        cy.get('#message')
          .type(this.fixt.body.text);
        cy.contains('Envoyer')
          .click();
        cy.contains(this.fixt.body.text);
      });
  });
  
  it('should receive a message', function () {
    cy.fixture('Sauron.json').as('fixt')
      .then(() => cy.loadEnvironment(this.fixt))
      .then(() => cy.wait(2000))
      .then(() => {
        cy.visit('/');
        cy.createMessage(this.fixt.body);
        cy.contains(this.fixt.body.text);
      });
  });
});