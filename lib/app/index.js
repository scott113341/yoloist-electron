import { makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import { run } from '@cycle/xstream-run';

import makeIpfsDriver from './drivers/ipfs-driver/index.js';
import makeYoloistDriver from './drivers/yoloist-driver/index.js';
import { App } from './app';

const main = App;

console.log(makeIpfsDriver);

const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver(),
  IPFS: makeIpfsDriver(),
  Yoloist: makeYoloistDriver()
};

run(main, drivers);
