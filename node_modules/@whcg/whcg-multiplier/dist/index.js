'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var polymerElement_js = require('@polymer/polymer/polymer-element.js');

/**
 * `WhcgNumberFieldBox`
 * 
 * @customElement
 * @polymer
 */

class WhcgMultiplier extends polymerElement_js.PolymerElement {


    //TODO: Takes alot time

    

    static get properties() {

        return {
            valueoutput: {
                type: String,
                notify: true,
                readOnly: false,
            },
            valuearray: {
                type: String,
                notify:true,
                readOnly: false,
                observer: '_valuearrayChanged'
            }
        }
    };



    _valuearrayChanged() {
        // console.log('this.valuearray');
        // console.log(this.valuearray);
        // console.log(JSON.parse(this.valuearray));
        let valuearrayobj = JSON.parse(this.valuearray);

        let product = valuearrayobj.reduce((acc, item) => {
            return acc * Number(item);
        }, 1);

        // console.log(product);

        this.valueoutput = product;
		// console.log('this.valueoutput!!');
		// console.log(this.valueoutput);
    }
}

window.customElements.define('whcg-multiplier', WhcgMultiplier);

exports.WhcgMultiplier = WhcgMultiplier;
