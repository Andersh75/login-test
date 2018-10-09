'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var polymerElement_js = require('@polymer/polymer/polymer-element.js');
require('@whcg/whcg-general-styles/icons.js');
require('@polymer/iron-icon');
require('@whcg/whcg-button-box');

class WhcgHeader extends polymerElement_js.PolymerElement {
    static get template() {
        return polymerElement_js.html `
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

exports.WhcgHeader = WhcgHeader;
