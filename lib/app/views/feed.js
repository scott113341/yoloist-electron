import { div, hr, p, pre } from '@cycle/dom';
import xs from 'xstream';

import C from '../constants.js';
import loading from '../components/loading.js';

export default function Feed (sources) {
  const friends = C.CONFIG_PRIVATE.friends;

  const posts$ = sources
    .Yoloist.getPosts(friends)
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
            ...posts.map(post),
            pre(`friends: ${stringify(friends)}`),
            // pre(`posts: ${stringify(posts)}`),
          ]
          : [loading],
      ])
    });

  return {
    DOM: vtree$
  };
}

function post (post) {
  return div('.post', [
    p(post.content),
    p(`- ${post.config.info.name}, ${(new Date(post.published)).toLocaleString()}`),
    p(post.tags.concat(post.id).join(', ')),
  ]);
}

function stringify (obj) {
  return JSON.stringify(obj, null, 2);
}
