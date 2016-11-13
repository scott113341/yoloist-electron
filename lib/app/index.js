import { makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import { run } from '@cycle/xstream-run';

import makeIpfsDriver from './drivers/ipfs-driver/index.js';
import makeYoloistDriver from './drivers/yoloist-driver/index.js';
import { App } from './app';

function start (ipfs) {
  const main = App;

  const drivers = {
    DOM: makeDOMDriver('#app'),
    HTTP: makeHTTPDriver(),
    IPFS: makeIpfsDriver(ipfs),
    Yoloist: makeYoloistDriver()
  };

  run(main, drivers);
}

module.exports = start;
