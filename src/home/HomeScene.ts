import { APPROVED_HOME_SVG } from './homeMarkup.js';

/** HomeScene owns the approved visual composition ONLY. No gameplay lives here. */
export function mountHome(target: HTMLElement): SVGSVGElement {
  target.innerHTML = `<main class="game" id="game-root">${APPROVED_HOME_SVG}</main>
    <div id="panel-backdrop" aria-hidden="true"><div class="panel" role="dialog" aria-modal="true" aria-labelledby="panel-title" tabindex="-1"><button type="button" id="close-panel" aria-label="Close menu">×</button><div id="panel-content"></div></div></div>
    <div id="toast" role="status" aria-live="polite"></div>`;
  const svg = target.querySelector<SVGSVGElement>('#home-art');
  if (!svg) throw new Error('Approved HomeScene SVG did not mount');
  return svg;
}
