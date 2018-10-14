'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var polymerElement_js = require('@polymer/polymer/polymer-element.js');

/**
 * `WhcgJsonMerger`
 * 
 * @customElement
 * @polymer
 */


class WhcgJsonMerger extends polymerElement_js.PolymerElement {
    
    static get properties() {

        return {
            whcgjsonarrayinput: {
                type: String,
                notify: true,
                readOnly: false,
                observer: '_whcgjsonarrayinputChanged'
            },
            whcgjsonoutput: {
                type: String,
                notify: true,
                readOnly: false,
            },
        }
    };

    _whcgjsonarrayinputChanged() {
        // console.log('this.whcgjsonarrayinput');
        // console.log(this.whcgjsonarrayinput);

        try {
            let parsedJson = JSON.parse(this.whcgjsonarrayinput);
            let resultsArr = parsedJson.map(item => item.result);
     
            let result = resultsArr.reduce((acc, results) => {
             return acc.concat(results);
            }, []);
     
            let whcgObj = {result: result};
            // console.log('whcgObj');
            // console.log(whcgObj);
     
            this.whcgjsonoutput = JSON.stringify(whcgObj);
        } catch(error) {
            // console.log('Not propper JSON');
        }
    } 
}

window.customElements.define('whcg-json-merger', WhcgJsonMerger);

exports.WhcgJsonMerger = WhcgJsonMerger;
