import fs from 'fs';
import ipfsd from 'ipfsd-ctl';
import path from 'path';

start();

async function start () {
  const ipfsPath = path.resolve(__dirname, '../ipfs');

  try {
    const ipfs = await startIpfs(ipfsPath);
    startApp(ipfs);
  } catch (e) {
    try {
      const ipfs = await startNewIpfs(ipfsPath);
      await initConfigs();
      startApp(ipfs);
    } catch (e) {
      cb(e);
    }
  }
}

async function startIpfs (ipfsPath) {
  console.log('startIpfs');
  return new Promise((resolve, reject) => {
    ipfsd.local(ipfsPath, (err, node) => {
      if (err) return reject(err);
      node.startDaemon((err, ipfs) => {
        if (err) return reject(err);
        resolve(ipfs);
      });
    });
  });
}

async function startNewIpfs (ipfsPath) {
  console.log('startNewIpfs');
  return new Promise((resolve, reject) => {
    ipfsd.disposableApi({ repoPath: ipfsPath }, (err, ipfs) => {
      if (err) return reject(err);
      resolve(ipfs);
    });
  });
}

async function initConfigs (ipfs) {
  const ipfsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../ipfs/config')));
  const privateKey = ipfsConfig.Identity.PrivKey;

  const privateConfig = { friends: [] };
  const publicConfig = { id: ipfsConfig.Identity.PeerID, info: {}, tags: [], posts: [] };

  fs.writeFileSync(path.join(__dirname, '../public/config.private.json'), JSON.stringify(privateConfig));
  fs.writeFileSync(path.join(__dirname, '../public/config.public.json'), JSON.stringify(publicConfig));
}

async function startApp (ipfs) {
  require('./app/index.js')(ipfs);
}
