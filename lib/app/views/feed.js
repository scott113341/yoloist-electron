import { div, p, pre } from '@cycle/dom';
import xs from 'xstream';

import C from '../constants.js';
import loading from '../components/loading.js';

export default function Feed (sources) {
  const friends = C.CONFIG_PRIVATE.friends;

  const ipfsCat$ = sources.IPFS
    .files.cat('QmeVkgAZNkV1Sc9xaS2Lt4KAPwbtBKzFUWWeHX4yQWT3GS')
    .map(buffer => buffer.toString())
    .startWith(null);

  const posts$ = sources
    .Yoloist.getFeeds(friends)
    // .map(feeds => feeds
    //   .reduce((a, c) => a.concat(c.body), [])
    //   .sort((a, b) => b.published - a.published)
    // )
    .startWith([])
    .debug('feeds$');

  const loading$ = loading(sources);
  const loadingDom$ = loading$.DOM;

  const vtree$ = xs
    .combine(ipfsCat$, loadingDom$, posts$)
    .map(([cat, loading, posts]) => {
      return div([
        cat ? null : loading,
        pre(`cat: ${cat}`),
        pre(`friends: ${stringify(friends)}`),
        pre(`posts: ${stringify(posts)}`),
      ])
    });

  return {
    DOM: vtree$
  };
}

function stringify (obj) {
  return JSON.stringify(obj, null, 2);
}
