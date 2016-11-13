import xs from 'xstream';

export default function makeIpfsDriver (ipfs) {
  return () => {
    return {
      id: ipfsCommand(ipfs.id, emitCallback),

      files: {
        cat: ipfsCommand(ipfs.files.cat, emitBufferedResponse),
        add: ipfsCommand(ipfs.files.add, emitCallback),
      },

      name: {
        publish: ipfsCommand(ipfs.name.publish, emitCallback),
      },

      swarm: {
        connect: ipfsCommand(ipfs.swarm.connect, emitCallback),
      },

      util: {
        addFromFs: ipfsCommand(ipfs.util.addFromFs, emitCallback),
      }
    }
  };

  function ipfsCommand (command, callback) {
    return (...args) => {
      const $ = xs.create();
      command.call(ipfs, ...args, callback($));
      return $;
    }
  }
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
