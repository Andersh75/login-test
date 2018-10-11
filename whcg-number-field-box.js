import {html, LitElement} from '@polymer/lit-element';
import {flex} from './flex.css.js';
import {classMap} from 'lit-html/directives/classMap.js'

class WhcgNumberFieldBox extends LitElement {
    
    render() {
        return html`
        ${flex}
        <div id="flexbox" class="flex ${classMap({'flex-column': this.column, 'flex-row': !this.column})}">
            <slot></slot>
        </div>  
    `
    };

    static get properties() {

        return {
            column: {
                type: Boolean,
                reflect: true,
            },
            name: {
                type: String,
                reflect: true,
            }
        }
    };



// //TODO: ADD MULTIPLY ATTRIBUTE

//     onSlotchange({target}) {
//         let assignednodes = target.assignedNodes();
        
//         let whcgNumberFieldArray = assignednodes.filter(element => {
//             return element.nodeName === "WHCG-NUMBER-FIELD";
//         });
        
//         let allElementHasData = true;

//         whcgNumberFieldArray.forEach(whcgNumberField => {
//             if (whcgNumberField.__data === undefined) {
//                 allElementHasData = false;
//             }
//         }); 

//         if (allElementHasData) {
//             let elementDataArray = whcgNumberFieldArray.map(element => element.__data);
//             let multipliedValue = this.arrayMultiplier(elementDataArray);
//             this.dispatchEvent(new CustomEvent('valueChanged', { bubbles: true, composed: true, detail: { value: multipliedValue } }))
//             // this.jsonBuilder(elementDataArray);
//         }        
//     };

    

//     //Multiplies all values in array
//     arrayMultiplier(arr) {
//         return arr.reduce((acc, cur) => {
//             return acc * Number(cur.value);
//         }, 1);
//     };

}

window.customElements.define('whcg-number-field-box', WhcgNumberFieldBox);

export { WhcgNumberFieldBox };









// _valuearrayChanged() {
//     let valuearrayobj = JSON.parse(this.valuearray);

//     let product = valuearrayobj.reduce((acc, item) => {
//         return acc * Number(item);
//     }, 1);

//     this.value = product;
// }

    // jsonBuilderSingleYear(childrenArr) {
    //     let whcgObj = {};
    //     whcgObj.result = [];

    //     function dataFactory(period) {
    //         let dataobj = {};

    //         let dataset = {};

    //         // console.log(period);

    //         for (let i = 0; i < period; i++) {
    //             dataset[i] = 0;
    //         }
    //         dataset[this.key] = Number(this.value);
           
    //         Object.assign(dataobj, {
    //             [this.datapackage]: {
    //                 label: this.label,
    //                 dataset: dataset
    //             }
    //         });

    //         return dataobj;
    //     }

    //     function resultElementObjFactory() {
    //         return {
    //             object: this.name,
    //             data: dataFactory.call(this, Number(this.period))
    //         }
    //     }

    //     whcgObj.result.push(resultElementObjFactory.call(this));

    //     this.whcgjsonoutput = JSON.stringify(whcgObj);
    // };








    //TODO: Takes alot time

    // connectedCallback() {
    //     super.connectedCallback();

    //     if (this.mode !== 'none') {
    //         this._collectChildren();
    //         this.addEventListener('childrenattached', e => {
    //         this._collectChildren();
    //         e.stopPropagation();
    //         });
    //     }

    // };



//     disconnectedCallback() {
// //TODO: remove events
//     }



// if (this.mode === 'singlefield') {
//     this.jsonBuilderSingleYear(childrenArr);
// } else {
   
// }



// jsonBuilder(childrenArr) {
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
//     this.whcgjsonoutput = JSON.stringify(whcgObj);
// };