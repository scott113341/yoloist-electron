import { div, span } from '@cycle/dom';
import xs from 'xstream';

export default function Loading (sources) {
  const dots$ = xs.periodic(500)
    .map(i => Array.from(Array(i % 4).keys()).map(i => span(['.'])));

  const dom$ = xs
    .combine(dots$)
    .map(([dots]) =>
      div([
        span('Loading'),
        ...dots
      ])
    );

  return {
    DOM: dom$
  };
}
