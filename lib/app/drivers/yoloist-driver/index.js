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
    const baseHashes = Promise.all(friends.map(f => ipfs.name.resolve(f.id)));
    const baseLss = baseHashes.then(hashes => {
      console.log('baseHashes', hashes);
      return Promise.all(hashes.map(h => ipfs.ls(h.Path)));
    });
    const configs = baseLss.then(lss => {
      console.log('baseLss', lss);
      return Promise.all(lss.map(ls => {
        const file = ls.Objects[0].Links.find(f => f.Name === 'config.public.json');
        return ipfs.cat(file.Hash).then(bufferStream('json'));
      }));
    });
    const posts = configs.then(configs => {
      console.log('configs', configs);
      const posts = configs
        .reduce((a, c) => a.concat(c.posts.map(p => {
          const { posts, ...config } = c;
          p.config = config;
          return p;
        })), [])
        .sort((a, b) => b.published - a.published);
      return Promise.all(posts.map(post =>
        ipfs.cat(post.id)
        .then(bufferStream('string'))
        .then(content => ({ ...post, content }))
      ));
    });
    return xs.fromPromise(posts);
  }

  function getPost(id) {
    return xs.fromPromise(request.get(`https://gateway.ipfs.io/ipfs/${id}`));
  }
}

function bufferStream (type = 'buffer') {
  return stream => {
    return new Promise(resolve => {
      const chunks = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(convertTo(Buffer.concat(chunks), type)));
    });
  }
}

function convertTo (buffer, type) {
  if (type === 'string') return buffer.toString();
  if (type === 'json') return JSON.parse(buffer);
  else return buffer;
}
