import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@whcg/whcg-general-styles/flex.js';

class WhcgBoxContainer extends PolymerElement {

  static get template() {
    return html`
    <style include="style-element-flex">

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
    <span class="headline">{{name}}</span>
    <div id="box" class="flex flex-row">
      <slot id="slotid"></slot>
    </div>
  `;
  }

  static get properties() {
    return {
      column: {
        type: Boolean,
        notify: true,
        readOnly: false,
        observer: '_setDirection',
      },
      name: {
        type: String,
        notify: true,
        readOnly: false,
      },
    };
  }

  _setDirection() {
    this.$.box.classList.remove('flex-row');
    this.$.box.classList.add('flex-column');
  }
}

window.customElements.define('whcg-box-container', WhcgBoxContainer);

export { WhcgBoxContainer };
