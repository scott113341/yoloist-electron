import { br, button, div, input, span, textarea } from '@cycle/dom';
import xs from 'xstream';

import DotDotDot from '../components/dot-dot-dot.js';

export default function AddFriend (sources) {

  // DOM EVENTS
  const addFriendClick$ = sources.DOM
    .select('.addFriendButton').events('click')
    .map(e => true);

  const cancelClick$ = sources.DOM
    .select('.cancelButton').events('click')
    .map(e => false);

  const idKeyupValue$ = sources.DOM
    .select('.id').events('keyup')
    .map(e => e.target.value);

  const addClick$ = sources.DOM
    .select('.addButton').events('click')
    .map(e => true)
    .startWith(false);

  // SHOW
  const show$ = xs
    .merge(addFriendClick$, cancelClick$)
    .startWith(false);

  // FRIEND ID CONTENT
  const id$ = xs
    .merge(idKeyupValue$, cancelClick$)
    .map(e => {
      if (e === false) return ''; // cancelClick
      else return e;
    })
    .startWith('');

  const addFriend$ = xs
    .combine(id$, addClick$)
    .map(([id, addClick]) => {
      console.log('wtf', id, addClick);
      return addClick ? sources.Yoloist.addFriend(id) : xs.of(null);
    })
    .flatten()
    .startWith(null)
    .debug('addFriend$');

  const adding = DotDotDot({ text$: xs.of('Adding friend') });

  const dom$ = xs
    .combine(show$, addClick$, adding.DOM, addFriend$)
    .map(([show, adding, addingDom, friend]) => {
      return show
        ? div([
            input('.id', {
              attrs: { disabled: !!friend, placeholder: 'IPFS ID' },
              style: { width: '400px' }
            }),
            br(),
            ...adding
              ? friend
                ? [
                    button('.cancelButton', 'Done'),
                    span({ style: { display: 'inline-block', width: '5px' }}),
                    span(`Added friend ${friend.info.name} (${friend.id})`),
                  ]
                : [addingDom]
              : [
                  button('.addButton', 'Add Friend'),
                  span({ style: { display: 'inline-block', width: '5px' }}),
                  button('.cancelButton', 'Cancel'),
                ]
          ])
        : div([
            button('.addFriendButton', 'Add Friend')
          ]);
    });

  return {
    DOM: dom$
  };
}
