import xs from 'xstream';

import start from './start.js';

export default function makeIpfsDriver () {
  console.log('init driver');
  return ipfsDriver;
}

function ipfsDriver () {
  return {
    start,

    id: ipfsCommand('id'),
    cat: ipfsCommand('files.cat', emitBufferOnStream)
  }
}


function ipfsCommand (path, callback = emitCallbackOnStream) {
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

function emitBufferOnStream ($) {
  const chunks = [];
  return (err, resStream) => {
    if (err) return $.shamefullySendError(err);
    resStream.on('data', chunk => chunks.push(chunk));
    resStream.on('end', () => $.shamefullySendNext(Buffer.concat(chunks)));
  };
}

function emitCallbackOnStream ($) {
  return (err, res) => {
    if (err) return $.shamefullySendError(err);
    $.shamefullySendNext(res);
  };
}



export const TYPES = {
  BOOT: Symbol(),
  CAT: Symbol(),
  ID: Symbol()
};
