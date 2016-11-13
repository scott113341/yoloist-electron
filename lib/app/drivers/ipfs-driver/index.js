import xs from 'xstream';

import start from './start.js';

export default function makeIpfsDriver () {
  console.log('init driver');
  return ipfsDriver;
}

function ipfsDriver () {
  return {
    start,

    id: ipfsCommand('id', emitCallback),

    files: {
      cat: ipfsCommand('files.cat', emitBufferedResponse),
      add: ipfsCommand('files.add', emitCallback),
    },

    name: {
      publish: ipfsCommand('name.publish', emitCallback),
    },

    swarm: {
      connect: ipfsCommand('swarm.connect', emitCallback),
    },

    util: {
      addFromFs: ipfsCommand('util.addFromFs', emitCallback),
    }
  }
}


function ipfsCommand (path, callback = emitCallback) {
  const $ = xs.create();
  const start$ = start();

  return (...args) => {
    console.log(args);
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

function emitBufferedResponse ($) {
  const chunks = [];
  return (err, resStream) => {
    if (err) return $.shamefullySendError(err);
    resStream.on('data', chunk => chunks.push(chunk));
    resStream.on('end', () => $.shamefullySendNext(Buffer.concat(chunks)));
  };
}

function emitCallback ($) {
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
