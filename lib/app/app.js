import { div, h1, h4, hr, p, pre } from '@cycle/dom';
import path from 'path';
import xs from 'xstream';

import C from './constants.js';
import AddFriend from './views/add-friend.js';
import Feed from './views/feed.js';
import Loading from './components/loading.js';
import NewPost from './components/new-post.js';

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
        return sources.IPFS.name.publish(publicDir.hash, C.IPFS_PUBLISH_TTL);
      } else return xs.of(null);
    })
    .flatten()
    .startWith(null)
    .debug('ipfsPublish$');

  const loading = Loading();
  const feed = Feed(sources);

  const publishNewPostProxy$ = xs.create();
  const newPost = NewPost({ ...sources, done$: publishNewPostProxy$ });
  const publishNewPost$ = newPost.post$
    .map(post => {
      if (!post) return xs.of(null);
      return sources.Yoloist.publishPost(post);
    })
    .flatten();
  publishNewPostProxy$.imitate(publishNewPost$);

  const addFriend = AddFriend(sources);

  const vtree$ = xs
    .combine(ipfsId$, time$, ipfsAdd$, ipfsConnect$, ipfsAddPublic$, ipfsPublish$, loading.DOM, feed.DOM, newPost.DOM, addFriend.DOM)
    .map(([id, time, add, connect, addPublic, publish, loading, feed, newPost, addFriend]) => {
      return div([
        h1('Yoloist'),
        p(`Signed in as ${C.CONFIG_PUBLIC.info.name}`),
        newPost,
        addFriend,

        hr(),

        h4('Feed'),
        feed,

        hr(),
        pre(`id: ${stringify(id)}`),
        // pre(`add "${time.slice(0, -1)}": ${stringify(add)}`),
        // pre(`connect: ${stringify(connect)}`),
        // pre(`addPublic: ${stringify(addPublic)}`),
        pre(`ipns: ${stringify(publish)}`),
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
