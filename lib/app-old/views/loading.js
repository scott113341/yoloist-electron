function loading (props = {}) {
  const { error } = props;
  return `
    <div>
      ${error
        ? `
          <h1>Error loading!</h1>
          <pre>${JSON.stringify(error, null, 2)}</pre>
          <pre>${JSON.stringify(error.stack.split('\n'), null, 2)}</pre>
          `
        : `<h1>Loading...</h1>`
      }
    </div>
  `;
}

module.exports = loading;
