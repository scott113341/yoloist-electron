import xs from 'xstream';
import request from 'superagent';

import C from '../../constants.js';

export default function makeYoloistDriver (ipfs) {
  return () => {
    return {
      get,
      getFeeds,
      getPost
    };
  };

  function get (url) {
    return xs.fromPromise(request.get(url));
  }

  function getFeeds (friends) {
    console.log('friends', friends);
    const hashes = Promise.all(friends.map(f => ipfs.name.resolve(f.id)));
    return xs.fromPromise(hashes);
  }

  function getPost(id) {
    return xs.fromPromise(request.get(`https://gateway.ipfs.io/ipfs/${id}`));
  }
}
