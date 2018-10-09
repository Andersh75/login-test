import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@whcg/whcg-general-styles/icons.js';
import '@polymer/iron-icon';
import '@whcg/whcg-button-box';

class WhcgHeader extends PolymerElement {
    static get template() {
        return html `
        <style>
            :host {
                display: grid;
                grid-template-columns: repeat(12, [col-start] 1fr);
                grid-template-rows: 100px;
                grid-gap: 20px;
                padding-bottom: 213px;
            }

            iron-icon {
                grid-column: col-start 2 / span 4;
                color: red;
                height: 85px;
                width: 268px;
                align-self: center;
                --iron-icon-width: 268px;
                --iron-icon-height: 85px;
            }


            whcg-button-box {
                grid-column: col-start 8 / span 4;
                align-self: center;
                justify-self: end;
            }
            

            
        </style>
            <iron-icon icon="parmaco-set:logo-crop"></iron-icon>
            <whcg-button-box></whcg-button-box>     
    `;
    }

    static get properties() {

        return {

           
        }
    }



}

window.customElements.define('whcg-header', WhcgHeader);

export { WhcgHeader };
