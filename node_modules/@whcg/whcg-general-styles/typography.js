import './version.js';
import '@polymer/polymer/lib/elements/custom-style.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<custom-style>
  <style>
    :root {

      /* Font families */
      --parmaco-font-family: "Exo 2", -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";

      /* Font sizes */
      --parmaco-font-size-xxs: .75rem;
      --parmaco-font-size-xs: .8125rem;
      --parmaco-font-size-s: .875rem;
      --parmaco-font-size-m: 1rem;
      --parmaco-font-size-l: 1.125rem;
      --parmaco-font-size-xl: 1.375rem;
      --parmaco-font-size-xxl: 1.75rem;
      --parmaco-font-size-xxxl: 2.5rem;
      --parmaco-font-size-xxxxl: 3.25rem;

      /* Line heights */
      --parmaco-line-height-none: 1;
      --parmaco-line-height-xs: 1.25;
      --parmaco-line-height-s: 1.375;
      --parmaco-line-height-m: 1.625;

      /* Font weights */
      --parmaco-font-weight-thin: 100;
      --parmaco-font-weight-extralight: 200;
      --parmaco-font-weight-light: 300;
      --parmaco-font-weight-normal: 400;
      --parmaco-font-weight-medium: 500;
      --parmaco-font-weight-semibold: 600;
      --parmaco-font-weight-bold: 700;
      --parmaco-font-weight-extrabold: 800;
      --parmaco-font-weight-black: 900;

      /* Heading */
      --h1-font-weight: 600;
      --h1-line-height: var(--parmaco-line-height-xs);
      --h1-margin-top: 1.25em;
      --h1-font-size: var(--parmaco-font-size-xxxl);
      --h1-margin-bottom: 0.75em;

      --h2-font-weight: 600;
      --h2-line-height: var(--parmaco-line-height-xs);
      --h2-margin-top: 1.25em;
      --h2-font-size: var(--parmaco-font-size-xxl);
      --h2-margin-bottom: 0.5em;

      --h3-font-weight: 600;
      --h3-line-height: var(--parmaco-line-height-xs);
      --h3-margin-top: 1.25em;
      --h3-font-size: var(--parmaco-font-size-xl);
      --h3-margin-bottom: 0.5em;

      --h4-font-weight: 600;
      --h4-line-height: var(--parmaco-line-height-xs);
      --h4-margin-top: 1.25em;
      --h4-font-size: var(--parmaco-font-size-l);
      --h4-margin-bottom: 0.5em;

      --h5-font-weight: 600;
      --h5-line-height: var(--parmaco-line-height-xs);
      --h5-margin-top: 1.25em;
      --h5-font-size: var(--parmaco-font-size-m);
      --h5-margin-bottom: 0.25em;

      --h6-font-weight: 600;
      --h6-line-height: var(--parmaco-line-height-xs);
      --h6-margin-top: 1.25em;
      --h6-font-size: var(--parmaco-font-size-xs);
      --h6-margin-bottom: 0;
      --h6-text-transform: uppercase;
      --h6-letter-spacing: 0.03em;
    }

  </style>
</custom-style>`;

document.head.appendChild($_documentContainer.content);



// <dom-module id="lumo-typography">
//   <template>
//     <style>
//       html {
//         font-family: var(--lumo-font-family);
//         font-size: var(--lumo-font-size, var(--lumo-font-size-m));
//         line-height: var(--lumo-line-height-m);
//         -webkit-text-size-adjust: 100%;
//         -webkit-font-smoothing: antialiased;
//         -moz-osx-font-smoothing: grayscale;
//       }

//       /* Can’t combine with the above selector because that doesn’t work in browsers without native shadow dom */
//       :host {
//         font-family: var(--lumo-font-family);
//         font-size: var(--lumo-font-size, var(--lumo-font-size-m));
//         line-height: var(--lumo-line-height-m);
//         -webkit-text-size-adjust: 100%;
//         -webkit-font-smoothing: antialiased;
//         -moz-osx-font-smoothing: grayscale;
//       }

//       small,
//       [theme~="font-size-s"] {
//         font-size: var(--lumo-font-size-s);
//         line-height: var(--lumo-line-height-s);
//       }

//       [theme~="font-size-xs"] {
//         font-size: var(--lumo-font-size-xs);
//         line-height: var(--lumo-line-height-xs);
//       }



//       p {
//         margin-top: 0.5em;
//         margin-bottom: 0.75em;
//       }

//       a {
//         text-decoration: none;
//       }

//       a:hover {
//         text-decoration: underline;
//       }

//       hr {
//         display: block;
//         align-self: stretch;
//         height: 1px;
//         border: 0;
//         padding: 0;
//         margin: var(--lumo-space-s) calc(var(--lumo-border-radius) / 2);
//         background-color: var(--lumo-contrast-10pct);
//       }
//     </style>
//   </template>
// </dom-module>
