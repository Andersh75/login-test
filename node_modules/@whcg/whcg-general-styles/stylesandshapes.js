import './version.js';
import '@polymer/polymer/lib/elements/custom-style.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<custom-style>
  <style>
    html {
        
      /* SHADOWS */
      --whcg-box-shadow-xs: 0px 0px 0px var(--whcg-shade-40pct), 0px 0px 0px var(--whcg-shade-20pct);
      --whcg-box-shadow-s: 0px 2px 8px var(--whcg-shade-40pct), 0px 1px 2px var(--whcg-shade-20pct);
      --whcg-box-shadow-m: 0px 8px 24px var(--whcg-shade-40pct), 0px 2px 6px var(--whcg-shade-20pct);
      --whcg-box-shadow-l: 0px 12px 48px var(--whcg-shade-40pct), 0px 3px 18px var(--whcg-shade-20pct);
      --whcg-box-shadow-xl: 0px 18px 64px var(--whcg-shade-40pct), 0px 4px 24px var(--whcg-shade-20pct);
      
      /* BORDERS */
      --parmaco-border-radius: 0.25em;
      --parmaco-border-style: solid;
      --parmaco-border-width: 1px;

      /* DIVIDERS */
      --parmaco-divider-left: -1px 0 0 0 var(--parmaco-black-color-10pct);

     
    }
  </style>
</custom-style>`;

document.head.appendChild($_documentContainer.content);