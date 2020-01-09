describe('test realtime chat', () => {

  beforeEach(() => {
    cy.viewport('iphone-6')
  })

  it('should enter a nickname', function () {
    cy.fixture(`Elrond.json`).as('fixt')
      .then(() => cy.loadEnvironment(this.fixt))
      .then(() => cy.wait(2000))
      .then(() => {
        cy.visit('/');
        cy.get('[placeholder="Send message..."]')
          .should('not.exist');

        cy.get('[placeholder="Username"]')
          .type(this.fixt.username)
          .type('{enter}');

        cy.get('[placeholder="Send message..."]')
          .should('exist');
        cy.get('[placeholder="Username"]')
          .should('not.exist');
      });
  });

  it('should fetch and display some messages', function () {
    cy.fixture(`Legolas.json`).as('fixt')
      .then(() => cy.loadEnvironment(this.fixt))
      .then(() => cy.wait(2000))
      .then(() => {
        cy.visit('/');
        cy.get('[placeholder="Username"]')
          .type(this.fixt.username)
          .type('{enter}');
        for (const message of this.fixt.messages) {
          cy.get(`[data-testid="${message.body.author === this.fixt.username ? 'fromMe' : 'fromOthers'}"]`)
            .within(() => {
              cy.contains(message.body.author);
              cy.contains(message.body.message);
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
        cy.get('[placeholder="Username"]')
          .type(this.fixt.username)
          .type('{enter}');
        cy.get('[placeholder="Send message..."]')
          .type(this.fixt.body.message)
          .type('{enter}');
        cy.get('[data-testid="fromMe"]')
          .within(() => {
            cy.contains(this.fixt.body.message);
            cy.contains(this.fixt.body.author);
          });
      });
  });

  it('should receive a message', function () {
    cy.fixture(`Sauron.json`).as('fixt')
      .then(() => cy.loadEnvironment(this.fixt))
      .then(() => cy.wait(2000))
      .then(() => {
        cy.visit('/');
        cy.get('[placeholder="Username"]')
          .type(this.fixt.username)
          .type('{enter}');
        cy.wait(2000)
        cy.createMessage(this.fixt.body);
        cy.get('[data-testid="fromOthers"]')
          .within(() => {
            cy.contains(this.fixt.body.message);
            cy.contains(this.fixt.body.author);
          });
      });
  });
});