
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="whcg-button-styles" theme-for="vaadin-button">
  <template>
    <style>
    :host {
      font-size: var(--whcg-host-font-size);
      min-width: var(--whcg-host-min-width);
      height: var(--whcg-host-height);
      padding-top: var(--whcg-host-padding-top);
      padding-bottom: var(--whcg-host-padding-bottom);
      padding-left: var(--whcg-host-padding-left);
      padding-right: var(--whcg-host-padding-right);
      box-sizing: border-box;
      background-color: var(--whcg-host-background-color);
      border-radius: var(--whcg-host-border-radius);
      border-style: var(--whcg-host-border-style);
      border-width: var(--whcg-host-border-width);
      border-color: var(--whcg-host-border-color);
      cursor: default;
    }
    
    [part="label"] {
      font-size: var(--whcg-label-font-size);
      font-family: var(--whcg-label-font-family);
      font-weight: var(--whcg-label-font-weight);
      line-height: var(--whcg-label-line-height);
      color: var(--whcg-label-color);
      padding-top: var(--whcg-label-padding-top);
      padding-bottom: var(--whcg-label-padding-bottom);
      padding-left: var(--whcg-label-padding-left);
      padding-right: var(--whcg-label-padding-right);
    }

  </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

