const fs = require('fs');
const path = require('path');

const home = require('./home.js');

function landing (props = {}) {
  const { id } = state;
  console.log('landing', state);

  const privateKey = getPrivateKey();

  return `
    <div>
      <h1>Welcome to Yoloist</h1>
      
      <p><button onclick="${scopeFunction(signIn)}">Sign In</button> if you already have an account</p>
      <p><input type="text"></p>

      <p>This is your Yoloist password. <strong>WRITE THIS DOWN AND NEVER LOSE IT!!!</strong></p>
      <span style="word-wrap: break-word">${privateKey}</span>
      <p><button onclick="${scopeFunction(confirm)}">Ok, I copied this down and will never lose it</button></p>
    </div>
  `;
}

function getPrivateKey () {
  const file = fs.readFileSync(path.resolve(__dirname, '../../../ipfs/config'));
  const config = JSON.parse(file.toString());
  return config.Identity.PrivKey;
}

function signIn () {
  console.log('yeeeeeeeeeee');
}

function confirm () {
  console.log('confirmed');
  render(home());
}

module.exports = landing;
