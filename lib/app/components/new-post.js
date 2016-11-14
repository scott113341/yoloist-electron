import { br, button, div, textarea } from '@cycle/dom';
import xs from 'xstream';

export default function NewPost (sources) {
  const show$ = sources.DOM
    .select('.newPost').events('click')
    .map(e => true)
    .startWith(false)
    .debug('show$');

  const content$ = sources.DOM
    .select('.content').events('keyup')
    .map(e => e.target.value)
    .startWith('');

  const savePost$ = sources.DOM
    .select('.savePost').events('click')
    .map(e => true)
    .startWith(false)
    .debug('savePost$');

  const post$ = xs
    .combine(content$, savePost$)
    .map(([content, savePost]) => {
      const post = {
        content,
        tags: ['all']
      };
      return savePost ? post : null;
    });

  const dom$ = xs
    .combine(show$)
    .map(([show]) => {
      return show
        ? div([
            textarea('.content'),
            br(),
            button('.savePost', 'Post to Yoloist')
          ])
        : div([
            button('.newPost', 'New Post')
          ]);
    });

  return {
    DOM: dom$,
    content$,
    post$,
  };
}
