import {html, LitElement} from '@polymer/lit-element';
import {flex} from './flex.css.js';
import {classMap} from 'lit-html/directives/classMap.js'

export class WhcgBoxContainer extends LitElement {
  
  static get properties() {
    return {
      column: {
        type: Boolean,
        reflect: true
      },
      name: {
        type: String,
        reflect: true
      }
    };
  }

  render() {
    return html`
    ${flex}
    <style>
      .headline {
        color: var(--whcg-box-container-headline-color);
        font-family: var(--whcg-box-container-headline-font-family);
        font-size: var(--whcg-box-container-headline-font-size);
        font-weight: var(--whcg-box-container-headline-font-weight);
      }

      ::slotted(*) {
        padding-right: var(--whcg-box-container-slotted-padding-right);
        padding-top: var(--whcg-box-container-slotted-padding-top);
      }
    </style>
    <span class="headline">${this.name}</span>
    <div id="box" class="flex ${classMap({'flex-column': this.column, 'flex-row': !this.column})}">
      <slot id="slotid"></slot>
    </div>
  `;
  }
}

window.customElements.define('whcg-box-container', WhcgBoxContainer);
