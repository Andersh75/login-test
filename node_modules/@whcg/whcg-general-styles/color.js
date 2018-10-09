import './version.js';
import '@polymer/polymer/lib/elements/custom-style.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<custom-style>
  <style>
    :root {
      /* Base (background) */
      --parmaco-base-color: #FFF;
      --parmaco-base-color-100pct: #FFF;

      --parmaco-transparent: transparent;

      /* Tint */
      --whcg-tint-5pct: hsla(0, 0%, 100%, 0.3);
      --whcg-tint-10pct: hsla(0, 0%, 100%, 0.37);
      --whcg-tint-20pct: hsla(0, 0%, 100%, 0.44);
      --whcg-tint-30pct: hsla(0, 0%, 100%, 0.5);
      --whcg-tint-40pct: hsla(0, 0%, 100%, 0.57);
      --whcg-tint-50pct: hsla(0, 0%, 100%, 0.64);
      --whcg-tint-60pct: hsla(0, 0%, 100%, 0.7);
      --whcg-tint-70pct: hsla(0, 0%, 100%, 0.77);
      --whcg-tint-80pct: hsla(0, 0%, 100%, 0.84);
      --whcg-tint-90pct: hsla(0, 0%, 100%, 0.9);
      --whcg-tint-100pct: #FFF;

      /* Shade */
      --whcg-shade-5pct: hsla(214, 61%, 25%, 0.05);
      --whcg-shade-10pct: hsla(214, 57%, 24%, 0.1);
      --whcg-shade-20pct: hsla(214, 53%, 23%, 0.16);
      --whcg-shade-30pct: hsla(214, 50%, 22%, 0.26);
      --whcg-shade-40pct: hsla(214, 47%, 21%, 0.38);
      --whcg-shade-50pct: hsla(214, 45%, 20%, 0.5);
      --whcg-shade-60pct: hsla(214, 43%, 19%, 0.61);
      --whcg-shade-70pct: hsla(214, 42%, 18%, 0.72);
      --whcg-shade-80pct: hsla(214, 41%, 17%, 0.83);
      --whcg-shade-90pct: hsla(214, 40%, 16%, 0.94);
      --whcg-shade-100pct: hsl(214, 35%, 15%);
      

      /* Primary */
      --parmaco-primary-color-100pct: hsla(202, 100%, 38%, 1.0);
      --parmaco-primary-color-90pct: hsla(202, 100%, 38%, 0.9);
      --parmaco-primary-color-80pct: hsla(202, 100%, 38%, 0.8);
      --parmaco-primary-color-70pct: hsla(202, 100%, 38%, 0.7);
      --parmaco-primary-color-60pct: hsla(202, 100%, 38%, 0.6);
      --parmaco-primary-color-50pct: hsla(202, 100%, 38%, 0.5);
      --parmaco-primary-color-40pct: hsla(202, 100%, 38%, 0.4);
      --parmaco-primary-color-30pct: hsla(202, 100%, 38%, 0.3);
      --parmaco-primary-color-20pct: hsla(202, 100%, 38%, 0.2);
      --parmaco-primary-color-10pct: hsla(202, 100%, 38%, 0.1);
      --parmaco-primary-text-color: var(--parmaco-primary-color-100pct);
      --parmaco-primary-contrast-color: #FFF;

      /* Secondary*/
      --parmaco-secondary-color-100pct: hsla(24, 100%, 50%, 1.0);
      --parmaco-secondary-color-90pct: hsla(24, 100%, 50%, 0.9);
      --parmaco-secondary-color-80pct: hsla(24, 100%, 50%, 0.8);
      --parmaco-secondary-color-70pct: hsla(24, 100%, 50%, 0.7);
      --parmaco-secondary-color-60pct: hsla(24, 100%, 50%, 0.6);
      --parmaco-secondary-color-50pct: hsla(24, 100%, 50%, 0.5);
      --parmaco-secondary-color-40pct: hsla(24, 100%, 50%, 0.4);
      --parmaco-secondary-color-30pct: hsla(24, 100%, 50%, 0.3);
      --parmaco-secondary-color-20pct: hsla(24, 100%, 50%, 0.2);
      --parmaco-secondary-color-10pct: hsla(24, 100%, 50%, 0.1);
      --parmaco-secondary-text-color: var(--parmaco-secondary-color-100pct);
      --parmaco-secondary-contrast-color: #FFF;

      /* Tertiary*/
      --parmaco-tertiary-color-100pct: hsla(0, 0%, 34%, 1.0);
      --parmaco-tertiary-color-90pct: hsla(0, 0%, 34%, 0.9);
      --parmaco-tertiary-color-80pct: hsla(0, 0%, 34%, 0.8);
      --parmaco-tertiary-color-70pct: hsla(0, 0%, 34%, 0.7);
      --parmaco-tertiary-color-60pct: hsla(0, 0%, 34%, 0.6);
      --parmaco-tertiary-color-50pct: hsla(0, 0%, 34%, 0.5);
      --parmaco-tertiary-color-40pct: hsla(0, 0%, 34%, 0.4);
      --parmaco-tertiary-color-30pct: hsla(0, 0%, 34%, 0.3);
      --parmaco-tertiary-color-20pct: hsla(0, 0%, 34%, 0.2);
      --parmaco-tertiary-color-10pct: hsla(0, 0%, 34%, 0.1);
      --parmaco-tertiary-text-color: var(--parmaco-tertiary-color-100pct);
      --parmaco-tertiary-contrast-color: #FFF;

      /* Attention */
      --parmaco-attention-color-100pct: hsla(35, 98%, 58%, 1.0);
      --parmaco-attention-color-90pct: hsla(35, 98%, 58%, 0.9);
      --parmaco-attention-color-80pct: hsla(35, 98%, 58%, 0.8);
      --parmaco-attention-color-70pct: hsla(35, 98%, 58%, 0.7);
      --parmaco-attention-color-60pct: hsla(35, 98%, 58%, 0.6);
      --parmaco-attention-color-50pct: hsla(35, 98%, 58%, 0.5);
      --parmaco-attention-color-40pct: hsla(35, 98%, 58%, 0.4);
      --parmaco-attention-color-30pct: hsla(35, 98%, 58%, 0.3);
      --parmaco-attention-color-20pct: hsla(35, 98%, 58%, 0.2);
      --parmaco-attention-color-10pct: hsla(35, 98%, 58%, 0.1);
      --parmaco-attention-text-color: var(--parmaco-attention-color-100pct);
      --parmaco-attention-contrast-color: #FFF;

      /*Black*/
      --parmaco-black-color-100pct: hsla(0, 0%, 5%, 1.0);
      --parmaco-black-color-90pct: hsla(0, 0%, 5%, 0.9);
      --parmaco-black-color-80pct: hsla(0, 0%, 5%, 0.8);
      --parmaco-black-color-70pct: hsla(0, 0%, 5%, 0.7);
      --parmaco-black-color-60pct: hsla(0, 0%, 5%, 0.6);
      --parmaco-black-color-50pct: hsla(0, 0%, 5%, 0.5);
      --parmaco-black-color-40pct: hsla(0, 0%, 5%, 0.4);
      --parmaco-black-color-30pct: hsla(0, 0%, 5%, 0.3);
      --parmaco-black-color-20pct: hsla(0, 0%, 5%, 0.2);
      --parmaco-black-color-10pct: hsla(0, 0%, 5%, 0.1);
      --parmaco-black-text-color: var(--parmaco-black-color-100pct);
      --parmaco-black-contrast-color: var(--parmaco-white-color-100pct);

      /*White*/
      --parmaco-white-color-100pct: hsla(0, 0%, 99%, 1.0);
      --parmaco-white-color-90pct: hsla(0, 0%, 99%, 0.9);
      --parmaco-white-color-80pct: hsla(0, 0%, 99%, 0.8);
      --parmaco-white-color-70pct: hsla(0, 0%, 99%, 0.7);
      --parmaco-white-color-60pct: hsla(0, 0%, 99%, 0.6);
      --parmaco-white-color-50pct: hsla(0, 0%, 99%, 0.5);
      --parmaco-white-color-40pct: hsla(0, 0%, 99%, 0.4);
      --parmaco-white-color-30pct: hsla(0, 0%, 99%, 0.3);
      --parmaco-white-color-20pct: hsla(0, 0%, 99%, 0.2);
      --parmaco-white-color-10pct: hsla(0, 0%, 99%, 0.1);
      --parmaco-white-text-color: var(--parmaco-white-color-100pct);
      --parmaco-white-contrast-color: var(--parmaco-black-color-100pct);

      /* Success */
      --parmaco-success-color: hsl(145, 80%, 42%); /* hsl(144,82%,37%); */
      --parmaco-success-color-50pct: hsla(145, 76%, 44%, 0.55);
      --parmaco-success-color-10pct: hsla(145, 76%, 44%, 0.12);
      --parmaco-success-text-color: hsl(145, 100%, 32%);
      --parmaco-success-contrast-color: #FFF;
    }
  </style>
</custom-style>`;

document.head.appendChild($_documentContainer.content);

/* Only needed for IE11 when you want to use the dark palette inside the light palette */
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
;



// html {
//   color: var(--parmaco-body-text-color);
//   background-color: var(--parmaco-base-color);
// }

// h1,
// h2,
// h3,
// h4,
// h5,
// h6 {
//   color: var(--parmaco-header-text-color);
// }

// a {
//   color: var(--parmaco-primary-text-color);
// }