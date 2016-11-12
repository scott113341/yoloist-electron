const async = require('async');
const fs = require('fs');
const ipfsd = require('ipfsd-ctl');
const path = require('path');

function boot (cb) {
  console.log('boot');

  const ipfsPath = path.resolve('.', 'ipfs');
  try { fs.existsSync(ipfsPath) }
  catch (e) { fs.mkdirSync(ipfsPath) }

  const options = {
    repoPath: ipfsPath
  };

  startIpfs(ipfsPath, (err, ipfs) => {
    if (err) startNewIpfs(options, (err, ipfs) => cb(err, ipfs, true));
    else cb(null, ipfs, false);
  });
}

function startIpfs (ipfsPath, cb) {
  console.log('startIpfs');
  async.waterfall([
    (done) => ipfsd.local(ipfsPath, done),
    (node, done) => node.startDaemon(done)
  ], cb);
}

function startNewIpfs (options, cb) {
  console.log('startNewIpfs');
  ipfsd.disposableApi(options, cb);
}

module.exports = boot;
