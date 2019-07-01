describe('test realtime chat', () => {
  let currentIt = 1;
  let env;
  
  before(() => {
    cy.initialisation();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.fixture(`Environment.${currentIt}.json`)
      .then((fixtures) => { env = fixtures; })
      .then(() => cy.log(`Environment ${currentIt}: `, env))
      .then(() => cy.loadEnvironment(env));
    cy.wait(2000);
  });

  afterEach(() => {
    currentIt++;
  });
    
  it('should enter a nickname', () => {
    cy.get('[placeholder="Enter your message"]')
      .should('not.exist');

    cy.get('[placeholder="Enter your nickname"]')
      .type(env.username);
    

    cy.contains('Valid')
      .click();

    cy.get('[placeholder="Enter your message"]')
      .should('exist');
    cy.get('[placeholder="Enter your nickname"]')
      .should('not.exist');
  });

  it('should fetch and display some messages', () => {
    cy.get('[placeholder="Enter your nickname"]')
      .type(env.username);
    cy.contains('Valid')
      .click();

    env.messages.forEach(message => {
      cy.get(message.payload.username === env.username ? '.fromMe': '.fromOthers')
        .within(() => {
          cy.contains(message.payload.value);
          cy.contains(message.payload.username);
        });
    });
  });

  it('should send a message', () => {
    cy.get('[placeholder="Enter your nickname"]')
      .type(env.username);
    cy.contains('Valid')
      .click();
    cy.createMessage({
      _id: '1',
      payload: env.payload
    });

    cy.get('.fromMe')
      .within(() => {
        cy.contains(env.payload.value);
        cy.contains(env.username);
      });
  });

  it('should receive a message', () => {
    cy.get('[placeholder="Enter your nickname"]')
      .type(env.username);
    cy.contains('Valid')
      .click();
    cy.createMessage({
      _id: '1',
      payload: env.payload
    });

    cy.get('.fromOthers')
      .within(() => {
        cy.contains(env.payload.value);
        cy.contains(env.payload.username);
      });  
  });
});