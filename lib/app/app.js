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

  const yoloistPublish$ = ipfsPublish$
    .map(pub => pub ? sources.Yoloist.publish(C.IPFS_ID, pub.Value) : null)
    .debug('yoloistPublish$');

  const loading$ = loading(sources);
  const loadingDom$ = loading$.DOM;

  const feed = Feed(sources);
  const feedDom$ = feed.DOM;

  const vtree$ = xs
    .combine(ipfsId$, time$, ipfsAdd$, ipfsConnect$, ipfsAddPublic$, ipfsPublish$, yoloistPublish$, loadingDom$, feedDom$)
    .map(([id, time, add, connect, addPublic, publish, ypublish, loading, feed]) => {
      return div([
        feed,
        hr(),
        pre(`id: ${stringify(id)}`),
        pre(`add "${time.slice(0, -1)}": ${stringify(add)}`),
        pre(`connect: ${stringify(connect)}`),
        pre(`addPublic: ${stringify(addPublic)}`),
        pre(`publish: ${stringify(publish)}`),
        pre(`yoloistPublish: ${stringify(ypublish)}`),
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
