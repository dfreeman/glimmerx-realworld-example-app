import { module, test, skip, renderComponent } from '../util';

import App from '../../src/App';

module('App test', () => {
  test('filler', (assert) => {
    assert.ok(true);
  });

  skip('it works', async (assert) => {
    await renderComponent(App, {
      services: {
        api: {
          currentUser: null,
        },
      },
    });

    assert.dom('h1').containsText('hello, glimmerx!');
    assert.dom('h3').containsText('you can get started by editing src/App.js');

    assert.dom('img').exists();
  });
});
