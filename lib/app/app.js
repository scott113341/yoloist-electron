import { div, p, pre } from '@cycle/dom';
import xs from 'xstream';

export function App (sources) {



  console.log(sources);
  const ipfsStart$ = sources.IPFS
    .start()
    .map(ipfs => ({ host: ipfs.apiHost, port: ipfs.apiPort }))
    .startWith(null)
    .debug('ipfsStart$');

  const ipfsId$ = sources.IPFS
    .id()
    .startWith(null)
    .debug('ipfsId$');

  const ipfsCat$ = sources.IPFS
    .cat('QmY5heUM5qgRubMDD1og9fhCPA6QdkMp3QCwd4s7gJsyE7')
    .map(res => res.toString())
    .startWith(null)
    .debug('ipfsCat$');

  let requestSymbol = Symbol();
  let request$ = xs.of({
    url: 'https://jsonplaceholder.typicode.com/users',
    category: requestSymbol
  });

  let response$ = sources.HTTP
    .select(requestSymbol)
    .flatten()
    .startWith({ text: 'loading...' })
    .debug('response$');

  const vtree$ = xs
    .combine(response$, ipfsStart$, ipfsId$, ipfsCat$)
    .map(([response, ipfs, id, cat]) => {
      return div([
        pre(`ipfs: ${JSON.stringify(ipfs, null, 2)}`),
        pre(`id: ${JSON.stringify(id, null, 2)}`),
        pre(`cat: ${cat}`),
        // p(`response: ${response.text}`),
      ])
    });

  const sinks = {
    DOM: vtree$,
    HTTP: request$,
    IPFS: ipfsStart$
  };
  return sinks;
}


function log (stuff) {
  console.log('log:', stuff);
  return stuff;
}
