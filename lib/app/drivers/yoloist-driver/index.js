import xs from 'xstream';
import request from 'superagent';

import C from '../../constants.js';

export default function makeYoloistDriver () {
  return yoloistDriver;
}

function yoloistDriver () {
  return {
    get,
    getFeeds,
    publish
  };
}



function get (url) {
  const $ = xs.create();
  request
    .get(url)
    .end(emitCallback($));
  return $;
}

function getFeeds (urls) {
  console.log('getFeeds', urls);
  const promise = Promise.all(urls.map(url => request.get(url)));
  return xs.fromPromise(promise);
}

function publish (id, ipns) {
  return xs.fromPromise(request.get(`${C.API_URL}/${id}/${ipns}`));
}




function ipfsCommand (path, callback = emitCallback) {
  const $ = xs.create();
  const start$ = start();

  return (...args) => {
    const listener = {
      next: ipfs => {
        const method = path.split('.').reduce((a, c) => a[c], ipfs);
        method.call(ipfs, ...args, callback($));
        start$.removeListener(listener);
      }
    };
    start$.addListener(listener);
    return $;
  };
}

function emitCallback ($) {
  return (err, res) => {
    if (err) return $.shamefullySendError(err);
    $.shamefullySendNext(res);
  };
}
