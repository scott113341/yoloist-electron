import p from 'es6-promise';
import fs from 'fs';
import path from 'path';
import request from 'superagent';
import xs from 'xstream';

import C from '../../constants.js';

export default function makeYoloistDriver (ipfs) {
  return () => {
    return {
      addFriend,
      get,
      getPosts,
      getPost,
      publishPost
    };
  };

  function publishPost (post) {
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
    await ipfs.name.publish(publicHash, C.IPFS_PUBLISH_TTL);
  }

  function addFriend (id) {
    const promise = new Promise(async (resolve) => {
      const privateConfig = JSON.parse(fs.readFileSync(C.CONFIG_PRIVATE_PATH));
      if (!privateConfig.friends.find(f => f.id === id)) {
        privateConfig.friends.push({ id, tags: ['all'] });
        fs.writeFileSync(C.CONFIG_PRIVATE_PATH, JSON.stringify(privateConfig, null, 2));
        await publishPublic();
      }
      resolve(await getConfig(id));
    });
    return xs.fromPromise(promise);
  }

  function get (url) {
    return xs.fromPromise(request.get(url));
  }

  function getPosts (friends) {
    const promise = Promise.resolve()
      .then(() => Promise.all(friends.map(f => ipfs.name.resolve(f.id).catch(() => null))))
      .then(baseHashes => Promise.all(baseHashes.filter(h => h).map(h => ipfs.ls(h.Path))))
      .then(lss => Promise.all(lss.map(ls => {
        const file = ls.Objects[0].Links.find(f => f.Name === 'config.public.json');
        return ipfs.cat(file.Hash).then(bufferStream('json'));
      })))
      .then(configs => {
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
    return xs.fromPromise(promise);
  }

  function getPost(id) {
    return xs.fromPromise(request.get(`https://gateway.ipfs.io/ipfs/${id}`));
  }



  async function getConfig (id, which = 'public') {
    const ipns = await ipfs.name.resolve(id);
    const links = await ipfs.ls(ipns.Path);
    const file = links.Objects[0].Links.find(f => f.Name === `config.${which}.json`);
    const stream = await ipfs.cat(file.Hash);
    return bufferStream('json')(stream);
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
