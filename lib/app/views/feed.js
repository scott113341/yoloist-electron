import { div, p, pre } from '@cycle/dom';
import xs from 'xstream';

import C from '../constants.js';
import loading from '../components/loading.js';

export default function Feed (sources) {
  const friends = C.CONFIG_PRIVATE.friends;

  const posts$ = sources
    .Yoloist.getFeeds(friends)
    .startWith([])
    .debug('posts$');

  const loading$ = loading(sources);
  const loadingDom$ = loading$.DOM;

  const vtree$ = xs
    .combine(loadingDom$, posts$)
    .map(([loading, posts]) => {
      return div([
        ...posts.length
          ? [
            pre(`friends: ${stringify(friends)}`),
            pre(`posts: ${stringify(posts)}`),
          ]
          : [loading],
      ])
    });

  return {
    DOM: vtree$
  };
}

function stringify (obj) {
  return JSON.stringify(obj, null, 2);
}
