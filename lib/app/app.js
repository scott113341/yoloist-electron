import { div, hr, p, pre } from '@cycle/dom';
import path from 'path';
import xs from 'xstream';

import C from './constants.js';
import Feed from './views/feed.js';
import loading from './components/loading.js';

export function App (sources) {
  const ipfsId$ = sources.IPFS
    .id()
    .startWith(null)
    .debug('ipfsId$');

  const time = `the time is ${Date.now()}\n`;
  const time$ = xs.of(time);

  const ipfsAdd$ = sources.IPFS
    .files.add(Buffer.from(time))
    .startWith(null)
    .debug('ipfsAdd$');

  const ipfsConnect$ = sources.IPFS
    .swarm.connect(C.YOLOIST_IPFS)
    .startWith(null)
    .debug('ipfsConnect$');

  console.log(path.resolve('./public'));
  const ipfsAddPublic$ = sources.IPFS
    .util.addFromFs(path.resolve('./public'), { recursive: true })
    .startWith(null)
    .debug('ipfsAddPublic$');

  const ipfsPublish$ = ipfsAddPublic$
    .map(files => {
      if (files) {
        const publicDir = files.slice(-1)[0];
        return sources.IPFS.name.publish(publicDir.hash, { t: '60s', ttl: '60s' });
      } else return xs.of(null);
    })
    .flatten()
    .startWith(null)
    .debug('ipfsPublish$');

  const loading$ = loading(sources);
  const loadingDom$ = loading$.DOM;

  const feed = Feed(sources);
  const feedDom$ = feed.DOM;

  const vtree$ = xs
    .combine(ipfsId$, time$, ipfsAdd$, ipfsConnect$, ipfsAddPublic$, ipfsPublish$, loadingDom$, feedDom$)
    .map(([id, time, add, connect, addPublic, publish, loading, feed]) => {
      return div([
        feed,
        hr(),
        pre(`id: ${stringify(id)}`),
        pre(`add "${time.slice(0, -1)}": ${stringify(add)}`),
        pre(`connect: ${stringify(connect)}`),
        pre(`addPublic: ${stringify(addPublic)}`),
        pre(`publish: ${stringify(publish)}`),
      ])
    });

  const sinks = {
    DOM: vtree$
  };
  return sinks;
}


function stringify (obj) {
  return JSON.stringify(obj, null, 2);
}
