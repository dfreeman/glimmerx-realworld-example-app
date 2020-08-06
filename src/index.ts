import { renderComponent } from '@glimmerx/core';

import App from './App';
import { APIService } from './utils/api';

renderComponent(App, {
  element: document.body,
  services: {
    api: new APIService('https://conduit.productionready.io/api'),
  },
});
