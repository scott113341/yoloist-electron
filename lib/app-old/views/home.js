const defaultProps = {

};

function home (propz = {}) {
  const props = Object.assign({}, defaultProps, propz);
  console.log('home', state, props);

  return `
    <div>
      <h1>Yoloist</h1>
      <pre>${JSON.stringify(props, null, 2)}</pre>
    </div>
  `;
}

function getStuff () {
  const { ipfs } = state;

  ipfs.files
}

module.exports = home;
