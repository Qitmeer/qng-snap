/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-nodejs-modules */
import { Buffer } from 'buffer';
import type { GatsbyBrowser } from 'gatsby';
import { StrictMode } from 'react';

import { App } from './src/App';
import { Root } from './src/Root';

Buffer.from('00ff');
window.Buffer = window.Buffer || Buffer;

export const wrapRootElement: GatsbyBrowser['wrapRootElement'] = ({
  element,
}) => (
  <StrictMode>
    <Root>{element}</Root>
  </StrictMode>
);

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({
  element,
}) => <App>{element}</App>;
