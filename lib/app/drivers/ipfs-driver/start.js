const async = require('async');
const fs = require('fs');
const ipfsd = require('ipfsd-ctl');
const path = require('path');
import xs from 'xstream';

let ipfs;
let starting = false;
let started = false;
const ipfs$ = xs.createWithMemory();

export default function start () {
  console.log('boot');

  if (starting) {
    console.log('already starting');
    return ipfs$;
  }
  starting = true;

  if (started) {
    console.log('already started');
    return xs.of(ipfs);
  }

  const ipfsPath = path.resolve('.', 'ipfs');
  try { fs.existsSync(ipfsPath) }
  catch (e) { fs.mkdirSync(ipfsPath) }

  startIpfs(ipfsPath, (err, ipfs) => {
    if (err) startNewIpfs({ repoPath: ipfsPath }, (err, ipfs) => {
      if (err) ipfs$.shamefullySendError(err);
      else finishStart(ipfs);
    });
    else finishStart(ipfs);
  });

  return ipfs$;
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

function finishStart (_ipfs) {
  ipfs = _ipfs;
  ipfs$.shamefullySendNext(ipfs);
}
