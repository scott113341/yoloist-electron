import { br, button, div, input, span, textarea } from '@cycle/dom';
import xs from 'xstream';

import DotDotDot from './dot-dot-dot.js';
import Loading from './loading.js';

export default function NewPost (sources) {
  const { done$ } = sources;

  // DOM EVENTS
  const newPostClick$ = sources.DOM
    .select('.newPostButton').events('click')
    .map(e => true);

  const cancelClick$ = sources.DOM
    .select('.cancelButton').events('click')
    .map(e => false);

  const contentKeyupValue$ = sources.DOM
    .select('.content').events('keyup')
    .map(e => e.target.value);

  const tagsKeyupValue$ = sources.DOM
    .select('.tags').events('keyup')
    .map(e => e.target.value.split(', ').filter(t => t.length));

  const publishPost$ = sources.DOM
    .select('.publishPostButton').events('click')
    .map(e => true)
    .startWith(false);

  // SHOW
  const show$ = xs
    .merge(newPostClick$, cancelClick$)
    .startWith(false);

  // POST CONTENT
  const content$ = xs
    .merge(contentKeyupValue$, cancelClick$)
    .map(e => {
      if (e === false) return ''; // cancelClick
      else return e;
    })
    .startWith('');

  const tags$ = xs
    .merge(tagsKeyupValue$, cancelClick$)
    .map(e => {
      if (e === false) return []; // cancelClick
      else return e;
    })
    .startWith('');

  const post$ = xs
    .combine(content$, tags$, publishPost$)
    .map(([content, tags, publishPost]) => {
      const post = {
        content,
        tags
      };
      return publishPost ? post : null;
    })
    .startWith(null);

  const publishing = DotDotDot({ text$: xs.of('Publishing') });

  const dom$ = xs
    .combine(show$, post$, publishing.DOM, done$)
    .map(([show, post, publishing, done]) => {
      return show
        ? div([
            textarea('.content', {
              attrs: { disabled: !!post },
              style: { width: '400px', height: '100px' }}
            ),
            br(),
            input('.tags', {
              attrs: { disabled: !!post, placeholder: 'comma, separated, tags' },
              style: { width: '400px' }
            }),
            br(),
            ...post
              ? done
                ? [
                    button('.cancelButton', 'Done'),
                    span({ style: { display: 'inline-block', width: '5px' }}),
                    span(`Published! IPFS hash: ${done.id}`),
                  ]
                : [publishing]
              : [
                  button('.publishPostButton', 'Publish'),
                  span({ style: { display: 'inline-block', width: '5px' }}),
                  button('.cancelButton', 'Cancel'),
                ]
          ])
        : div([
            button('.newPostButton', 'New Post')
          ]);
    });

  return {
    DOM: dom$,
    content$,
    post$
  };
}
