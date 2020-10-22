const publicKey = 'ak_2fxchiLvnj9VADMAXHBiKPsaCEsTFehAspcmWJ3ZzF3pFK1hB5';

describe('Test cases for Withdraw Page', () => {
  it('Opens Withdraw page, uses scan button, validates entered amount, reviews and sends ', () => {
    cy.login()
      .openWithdraw()
      .get('[data-cy=send-container]')
      .should('be.visible')

      .get('[data-cy=scan-button]')
      .click()
      .get('.primary-title')
      .should('be.visible')
      .get('.modal--close')
      .click()

      .enterAmountSend('asd')
      .inputShouldHaveError('[data-cy=input-number]')
      .get('[data-cy=amount-currency]')
      .invoke('text')
      .then(text => expect(text.trim()).to.eq('$0.00'))
      .enterAmountSend(0)
      .get('[data-cy=input-number]')
      .should('have.class', 'has-error')
      .enterAmountSend(0.1)
      .get('[data-cy=input-number]')
      .should('not.have.class', 'has-error')
      .enterAddress('asd')
      .inputShouldHaveError('[data-cy=address]')
      .enterAddress(0)
      .inputShouldHaveError('[data-cy=address]')
      .enterAddress('vmangelovv.chain')
      .should('not.have.class', 'has-error')
      .enterAddress('ak_wMHNCzQJ4HUL3TZ1fi6nQsHg6TjmHLs1bPXSp8iQ1VmxGNAZ4')
      .get('[data-cy=address]')
      .should('not.have.class', 'has-error')

      .get('[data-cy=review-withdraw]')
      .should('not.have.class', 'disabled')
      .click()
      .get('div.step2')
      .should('be.visible')

      // check on step2 if everything is OK
      .get('[data-cy=review-sendingAddress]')
      .should('have.text', publicKey)
      .get('[data-cy=review-receivingAddress]')
      .should('have.text', 'ak_wMHNCzQJ4HUL3TZ1fi6nQsHg6TjmHLs1bPXSp8iQ1VmxGNAZ4')
      .get('[data-cy=review-amount]')
      .should('have.text', '0.100 AE')

      // edit sending address to .chain name
      .get('[data-cy=reivew-editTxDetails-button]')
      .click()
      .enterAddress('vmangelovv.chain')
      .get('[data-cy=review-withdraw]')
      .click()
      .get('[data-cy=review-receivingAddress]')
      .should('have.text', 'vmangelovv.chain')

      // send
      .get('[data-cy="review-send-button"]')
      .should('be.visible')
      .click()
      .get('[data-cy=pending-txs]')
      .should('be.visible');
  });
});
