const fs = require('fs');
const ipfsd = require('ipfsd-ctl');
const path = require('path');

start();

async function start () {
  const ipfsPath = path.resolve(__dirname, '../ipfs');
  try { fs.mkdirSync(ipfsPath) } catch(e) {}

  try {
    const ipfs = await startIpfs(ipfsPath);
    startApp(ipfs);
  } catch (e) {
    try {
      const ipfs = await startNewIpfs(ipfsPath);
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

async function startApp (ipfs) {
  require('./app/index.js')(ipfs);
}
