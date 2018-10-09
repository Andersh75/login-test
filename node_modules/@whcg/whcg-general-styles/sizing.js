import './version.js';
import '@polymer/polymer/lib/elements/custom-style.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<custom-style>
  <style>
    :root {
      --parmaco-size-xs: 1.625rem;
      --parmaco-size-s: 1.875rem;
      --parmaco-size-m: 2.25rem;
      --parmaco-size-l: 2.75rem;
      --parmaco-size-xl: 3.5rem;

      /* Icons */
      --parmaco-icon-size-s: 1.25em;
      --parmaco-icon-size-m: 1.5em;
      --parmaco-icon-size-l: 2.25em;
      /* For backwards compatibility */
      --parmaco-icon-size: var(--parmaco-icon-size-m);
    }
  </style>
</custom-style>`;

document.head.appendChild($_documentContainer.content);
