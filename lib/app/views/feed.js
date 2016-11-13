import { div, p, pre } from '@cycle/dom';
import xs from 'xstream';

import C from '../constants.js';
import loading from '../components/loading.js';

export default function Feed (sources) {

  const ipfsCat$ = sources.IPFS
    .files.cat('QmeVkgAZNkV1Sc9xaS2Lt4KAPwbtBKzFUWWeHX4yQWT3GS')
    .map(buffer => buffer.toString())
    .startWith(null);

  const friends$ = xs.of(C.CONFIG_PRIVATE.friends);

  const feedUrls$ = friends$
    .map(friends => {
      const urls = [];
      friends.forEach(friend => {
        urls.push(...friend.tags.map(tag => `${C.API_URL}/user/${friend.id}/${tag}.json`));
      });
      return urls;
    });

  const feedUrls = C.CONFIG_PRIVATE.friends
    .reduce((friends, friend) => friends.concat(
      friend.tags.map(tag => `${C.API_URL}/user/${friend.id}/${tag}`)
    ), []);
  console.log(feedUrls);
  const feeds$ = sources
    .Yoloist.getFeeds(feedUrls)
    .startWith([]);

  const loading$ = loading(sources);
  const loadingDom$ = loading$.DOM;

  const vtree$ = xs
    .combine(ipfsCat$, loadingDom$, friends$, feedUrls$, feeds$)
    .map(([cat, loading, friends, feedUrls, feeds]) => {
      return div([
        cat ? null : loading,
        pre(`cat: ${cat}`),
        pre(`friends: ${stringify(friends)}`),
        pre(`feedUrls: ${stringify(feedUrls)}`),
        pre(`feeds: ${stringify(feeds)}`),
      ])
    });

  return {
    DOM: vtree$
  };
}

function stringify (obj) {
  return JSON.stringify(obj, null, 2);
}
