const async = require('async');
const path = require('path');

const boot = require('./boot.js');
const home = require('../views/home.js');
const landing = require('../views/landing.js');
const loading = require('../views/loading.js');

/* GLOBALS */
global.state = {};
global.render = render;
global.scopeFunction = scopeFunction;

function render (...htmls) {
  document.body.innerHTML = htmls.join('');
}

function scopeFunction (fn) {
  if (!this.cache) this.cache = new Map();

  let scoped = this.cache.get(fn);
  if (!scoped) {
    scoped = `fn${Date.now().toString() + parseInt(Math.random() * 1000)}`;
    this.cache.set(fn, scoped);
    global[scoped] = fn;
  }

  return `${scoped}()`;
}

/* START */
render(loading(state));

console.log(path.resolve('./public'));

async.waterfall([
  (done) => boot(done),
  (ipfs, isNew, done) => { Object.assign(state, { ipfs, isNew }); done(); },
  (done) => async.parallel([
    (done) => state.ipfs.id(done),
    (done) => state.ipfs.util.addFromFs(path.resolve('./public'), { recursive: true }, done),
    (done) => state.ipfs.swarm.connect('/ip4/104.236.141.25/tcp/4001/ipfs/QmXR9Mbf9SRutksLyF1ASz2QbzPwUd4EBapPHXpzNPDuqQ', done),
    (done) => state.ipfs.files.add(Buffer.from(`zzz${Date.now()}\n`), done)
  ], done),
  (results, done) => {
    const [id, pub, swarm, file] = results;
    const info = { id, pub, swarm, file };
    Object.assign(state, info);
    console.log('hereeeeeeee', state);
    done();
  },
  (done) => {
    const pubHash = state.pub[state.pub.length - 1].hash;
    state.ipfs.name.publish(pubHash, { t: '60s', ttl: '60s' }, done);
  },
  (yolo, done) => { Object.assign(state, { yolo }); done(); }
], (err) => {
  if (err) return render(loading({ error: err }));
  state.isNew ? render(landing()) : render(home());
});
