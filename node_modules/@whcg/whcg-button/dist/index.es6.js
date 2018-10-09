import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@vaadin/vaadin-button/src/vaadin-button.js';

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

class WhcgButton extends PolymerElement {
    static get template() {
        return html`

        <style>
             vaadin-button {
                --whcg-host-font-size: var(--whcg-button-host-font-size);
                --whcg-host-background-color: var(--whcg-button-host-background-color);
                --whcg-host-border-radius: var(--whcg-button-host-border-radius);
                --whcg-host-border-style: var(--whcg-button-host-border-style);
                --whcg-host-border-width: var(--whcg-button-host-border-width);
                --whcg-host-border-color: var(--whcg-button-host-border-color);
                --whcg-host-height: var(--whcg-button-host-height);
                --whcg-host-min-width: var(--whcg-button-host-min-width);
                --whcg-host-padding-top: var(--whcg-button-host-padding-top);
                --whcg-host-padding-bottom: var(--whcg-button-host-padding-bottom);
                --whcg-host-padding-left: var(--whcg-button-host-padding-left);
                --whcg-host-padding-right: var(--whcg-button-host-padding-right);
                
                --whcg-label-font-size: var(--whcg-button-label-font-size);
                --whcg-label-font-weight: var(--whcg-button-label-font-weight);
                --whcg-label-font-family: var(--whcg-button-label-font-family);
                --whcg-label-line-height: var(--whcg-button-label-line-height); 
                --whcg-label-padding-top: var(--whcg-button-label-padding-top);
                --whcg-label-padding-bottom: var(--whcg-button-label-padding-bottom);
                --whcg-label-padding-left: var(--whcg-button-label-padding-left);
                --whcg-label-padding-right: var(--whcg-button-label-padding-right);
                --whcg-label-color: var(--whcg-button-label-color);
             }
        </style>

        <vaadin-button>
            <slot></slot>
        </vaadin-button>

    `;
    }

    static get properties() {

        return {

        }
    }

    

    

}

window.customElements.define('whcg-button', WhcgButton);

export { WhcgButton };
