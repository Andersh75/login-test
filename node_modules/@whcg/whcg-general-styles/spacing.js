import './version.js';
import '@polymer/polymer/lib/elements/custom-style.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<custom-style>
  <style>
    html {
      /* Square */
      --parmaco-space-xs: 0.25rem;
      --parmaco-space-s: 0.5rem;
      --parmaco-space-m: 1rem;
      --parmaco-space-l: 1.5rem;
      --parmaco-space-xl: 2.5rem;

      /* Wide */
      --parmaco-space-wide-xs: calc(var(--parmaco-space-xs) / 2) var(--parmaco-space-xs);
      --parmaco-space-wide-s: calc(var(--parmaco-space-s) / 2) var(--parmaco-space-s);
      --parmaco-space-wide-m: calc(var(--parmaco-space-m) / 2) var(--parmaco-space-m);
      --parmaco-space-wide-l: calc(var(--parmaco-space-l) / 2) var(--parmaco-space-l);
      --parmaco-space-wide-xl: calc(var(--parmaco-space-xl) / 2) var(--parmaco-space-xl);

      /* Tall */
      --parmaco-space-tall-xs: var(--parmaco-space-xs) calc(var(--parmaco-space-xs) / 2);
      --parmaco-space-tall-s: var(--parmaco-space-s) calc(var(--parmaco-space-s) / 2);
      --parmaco-space-tall-m: var(--parmaco-space-m) calc(var(--parmaco-space-m) / 2);
      --parmaco-space-tall-l: var(--parmaco-space-l) calc(var(--parmaco-space-l) / 2);
      --parmaco-space-tall-xl: var(--parmaco-space-xl) calc(var(--parmaco-space-xl) / 2);
    }
  </style>
</custom-style>`;

document.head.appendChild($_documentContainer.content);
