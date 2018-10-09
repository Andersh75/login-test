import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@whcg/whcg-button';

class WhcgButtonBox extends PolymerElement {
    static get template() {
        return html `
        <style>
            whcg-button {
                padding-left: 10px;
            }

        </style>
            <whcg-button>LOGGA IN</whcg-button>
            <whcg-button>SKAPA KONTO</whcg-button>
    `;
    }

    static get properties() {

        return {

           
        }
    }



}

window.customElements.define('whcg-button-box', WhcgButtonBox);

export { WhcgButtonBox };
