'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var polymerElement_js = require('@polymer/polymer/polymer-element.js');

/**
 * `WhcgNumberFieldBox`
 * 
 * @customElement
 * @polymer
 */

class WhcgJsonMaker extends polymerElement_js.PolymerElement {
    


    static get properties() {

        return {
           
            whcgjsonoutput: {
                type: String,
                notify: true,
                readOnly: false,
			},
			fill: {
                type: Boolean,
                notify: true,
				readOnly: false,
				value: false
            },
            datapackage: {
                type: String,
                notify: true,
                readOnly: false,
            },
            name: {
                type: String,
                notify: true,
                readOnly: false,
            },
            label: {
                type: String,
                notify: true,
                readOnly: false,
                value: ''
            },
            key: {
                type: String,
                notify: true,
                readOnly: false,
            },
            value: {
                type: String,
                notify: true,
                readOnly: false,
            },
        }
    };

    static get observers() {
        return [
            'jsonBuilder(period, value, key, label, name, datapackage, fill)'
        ]
	}
	

	jsonBuilder() {

        let whcgObj = {};
        whcgObj.result = [];

        function dataFactory(period) {
            let dataobj = {};

            let dataset = {};

			// console.log(period);
			
			let defaultValue = 0;

			if (this.fill) {
				defaultValue = Number(this.value);
			} 


            for (let i = 0; i < period; i++) {
                dataset[i] = defaultValue;
            }
            dataset[this.key] = Number(this.value);
           
            Object.assign(dataobj, {
                [this.datapackage]: {
                    label: this.label,
                    dataset: dataset
                }
            });

            return dataobj;
        }

        function resultElementObjFactory() {
            return {
                object: this.name,
                data: dataFactory.call(this, Number(this.period))
            }
        }

        whcgObj.result.push(resultElementObjFactory.call(this));

        this.whcgjsonoutput = JSON.stringify(whcgObj);

        // console.log('!whcgObj');
        // console.log(whcgObj);
    };

    // _valuearrayChanged() {
    //     console.log('this.valuearray');
    //     console.log(this.valuearray);
    //     console.log(JSON.parse(this.valuearray));
    //     let valuearrayobj = JSON.parse(this.valuearray);

    //     let product = valuearrayobj.reduce((acc, item) => {
    //         return acc * Number(item);
    //     }, 1);

    //     console.log(product);

    //     this.value = product;
    //     console.log(this.value);
    // }

    // _collectChildren() {
    //     let assignednodes = this.$.slotid.assignedNodes();
        
    //     let filteredArr = assignednodes.filter(element => {
    //         return element.nodeName === "WHCG-NUMBER-FIELD";
    //     });

    //     let childrenArr = filteredArr.map(element => element.__data);
        
    //     let undefinedElement = false;

    //     childrenArr.forEach(element => {
    //         if (element === undefined) {
    //             undefinedElement = true;
    //         }
    //     }); 

    //     if (!undefinedElement) {

    //         if (this.mode === 'singlefield') {
    //             this.jsonBuilderSingleYear(childrenArr);
    //         } else {
    //             this.outputValue = this.arrayMultiplier(childrenArr);
    //             this.jsonBuilder(childrenArr);
    //         }
    //     }
        
    // };








    // jsonBuilder(childrenArr) {

    //     console.log('childrenArr');
    //     console.log(childrenArr);
    //     let whcgObj = {};
    //     whcgObj.result = [];

    //     function dataFactory(item) {
    //         let dataobj = {};
    //         for (let i = 0; i < Number(item); i++) {
    //             Object.assign(dataobj, {
    //                 [childrenArr[i].kind]: {
    //                     label: childrenArr[i].label,
    //                     dataset: {
    //                         [childrenArr[i].period]: Number(childrenArr[i].value)
    //                     }
    //                 }
    //             });
    //         }

    //         Object.assign(dataobj, {
    //             [this.datapackage]: {
    //                 label: this.datapackage,
    //                 dataset: {
    //                     [this.period]: Number(this.outputValue)
    //                 }
    //             }
    //         });

    //         return dataobj;
    //     }

    //     function resultElementObjFactory() {
    //         return {
    //             object: this.name,
    //             data: dataFactory.call(this, childrenArr.length)
    //         }
    //     }

    //     whcgObj.result.push(resultElementObjFactory.call(this));



    //     console.log('whcgObj!');
    //     console.log(whcgObj);
    //     this.whcgjsonoutput = JSON.stringify(whcgObj);

    //     console.log(this.whcgjsonoutput);
    // };

    // arrayMultiplier(arr) {
    //     return arr.reduce((acc, cur) => {
    //         return acc * Number(cur.value);
    //     }, 1);
    // };

    // _setDirection() {
    //     this.$.flexbox.classList.remove('row');
    //     this.$.flexbox.classList.add('column');
    // };
}

window.customElements.define('whcg-json-maker', WhcgJsonMaker);

exports.WhcgJsonMaker = WhcgJsonMaker;
