import { div, span } from '@cycle/dom';
import xs from 'xstream';

export default function DotDotDot (sources) {
  const { text$ } = sources;

  const dots$ = xs.periodic(500)
    .map(i => Array.from(Array(i % 4).keys()).map(i => span(['.'])));

  const dom$ = xs
    .combine(text$, dots$)
    .map(([text, dots]) =>
      div([
        span(text),
        ...dots
      ])
    );

  return {
    DOM: dom$
  };
}
