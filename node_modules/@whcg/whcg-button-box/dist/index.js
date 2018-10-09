'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var polymerElement_js = require('@polymer/polymer/polymer-element.js');
require('@whcg/whcg-button');

class WhcgButtonBox extends polymerElement_js.PolymerElement {
    static get template() {
        return polymerElement_js.html `
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

exports.WhcgButtonBox = WhcgButtonBox;
