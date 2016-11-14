import p from 'es6-promise';
import fs from 'fs';
import path from 'path';
import request from 'superagent';
import xs from 'xstream';

import C from '../../constants.js';

export default function makeYoloistDriver (ipfs) {
  return () => {
    return {
      get,
      getPosts,
      getPost,
      publishPost
    };
  };

  function publishPost (post) {
    console.log('publishPosttttttttt', post);
    const promise = new Promise(async (resolve) => {
      const [hash] = await ipfs.add(Buffer.from(post.content));
      const fullPost = {
        id: hash.hash,
        published: Date.now(),
        tags: post.tags
      };

      const config = JSON.parse(fs.readFileSync(C.CONFIG_PUBLIC_PATH));
      config.posts.push(fullPost);
      fs.writeFileSync(C.CONFIG_PUBLIC_PATH, JSON.stringify(config, null, 2));

      await publishPublic();

      resolve(fullPost);
    });
    return xs.fromPromise(promise);
  }

  async function publishPublic () {
    const addPublicDir = await ipfs.util.addFromFs(path.resolve('./public'), { recursive: true });
    const publicHash = addPublicDir.slice(-1)[0].hash;
    await ipfs.name.publish(publicHash, { t: '1h', ttl: '1h' });
  }

  function get (url) {
    return xs.fromPromise(request.get(url));
  }

  function getPosts (friends) {
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
        .reduce((a, c) => a.concat(c.posts
          .filter(post => post.tags.find(tag => friends.find(f => f.id === c.id).tags.includes(tag)))
          .map(post => {
            const { posts, ...config } = c;
            post.config = config;
            return post;
          })
        ), [])
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
