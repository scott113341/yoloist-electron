import { div, hr, p, pre } from '@cycle/dom';
import path from 'path';
import xs from 'xstream';

import Feed from './views/feed.js';
import loading from './components/loading.js';

export function App (sources) {
  const ipfsStart$ = sources.IPFS
    .start()
    .map(ipfs => ({ host: ipfs.apiHost, port: ipfs.apiPort }))
    .startWith(null)
    .debug('ipfsStart$');

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
    .swarm.connect('/ip4/104.236.141.25/tcp/4001/ipfs/QmXR9Mbf9SRutksLyF1ASz2QbzPwUd4EBapPHXpzNPDuqQ')
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
        console.log('yeeeeeeeee', publicDir);
        return sources.IPFS.name.publish(publicDir.hash, { t: '60s', ttl: '60s' });
      }
      return xs.of(null);
    })
    .flatten()
    .startWith(null)
    .debug('ipfsPublish$');

  const loading$ = loading(sources);
  const loadingDom$ = loading$.DOM;

  const feed = Feed(sources);
  const feedDom$ = feed.DOM;

  const vtree$ = xs
    .combine(ipfsStart$, ipfsId$, time$, ipfsAdd$, ipfsConnect$, ipfsAddPublic$, ipfsPublish$, loadingDom$, feedDom$)
    .map(([ipfs, id, time, add, connect, addPublic, publish, loading, feed]) => {
      return div([
        loading,
        hr(),
        feed,
        hr(),
        pre(`ipfs: ${stringify(ipfs)}`),
        pre(`id: ${stringify(id)}`),
        pre(`add "${time.slice(0, -1)}": ${stringify(add)}`),
        pre(`connect: ${stringify(connect)}`),
        pre(`addPublic: ${stringify(addPublic)}`),
        pre(`publish: ${stringify(publish)}`),
      ])
    });

  const sinks = {
    DOM: vtree$,
    IPFS: ipfsStart$
  };
  return sinks;
}


function stringify (obj) {
  return JSON.stringify(obj, null, 2);
}
