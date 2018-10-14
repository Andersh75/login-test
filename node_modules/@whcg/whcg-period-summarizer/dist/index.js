'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var polymerElement_js = require('@polymer/polymer/polymer-element.js');

/**
 * `WhcgPeriodCompounder`
 * 
 * @customElement
 * @polymer
 */

class WhcgPeriodSummarizer extends polymerElement_js.PolymerElement {
    
    static get properties() {

        return {
            period: {
                type: String,
                notify: true,
                readOnly: false,
            },
            rate: {
                type: String,
                notify: true,
                readOnly: false,
            },
            whcgjsoninput: {
                type: String,
                notify: true,
                readOnly: false,
                observer: '_whcgjsoninputChanged'
            },
            label: {
                type: String,
                notify: true,
                readOnly: false,
            },
            whcgjsonoutput: {
                type: String,
                notify: true,
                readOnly: false,
            },
            name: {
                type: String,
                notify: true,
                readOnly: false,
            },
            mode: {
                type: String,
                notify: true,
                readOnly: false,
            },
        }
    };

    static get observers() {
        return [
            // 'multiplier(period, rate, initialValue)',
            'summarizer(whcgjsoninput)'
        ]
    }

    _whcgjsoninputChanged() {
        // console.log('this.whcgjsoninput');
        // console.log(this.whcgjsoninput);
    }

    // multiplier() {
    //     console.log(Number(this.period) * Number(this.rate) * Number(this.initialValue));
    // };

    summarizer() {
		// console.log('SUMMARIZE!!!!');
		// console.log(this.whcgjsoninput);
		let test1 = JSON.parse(this.whcgjsoninput);
		// console.log(test1);


        
        let result = test1.result.map(result => {
            let yearlyamounts = result.data.yearlyamounts;
            let thekeys = Object.keys(yearlyamounts.dataset);
            let thevalues = Object.values(yearlyamounts.dataset);
            yearlyamounts.datasetkeys = thekeys;
            yearlyamounts.datasetvalues = thevalues;

            result.data.yearlyamounts = yearlyamounts;

            return result;
        });

        // console.log('result');
        // console.log(result);

        let datasetKeys = test1.result[0].data.yearlyamounts.datasetkeys;

        let acc = 0;
        
        if (this.mode === 'multiply') {
            acc = 1;
        }

        let sums = datasetKeys.map(datasetKey => {
            return test1.result.reduce((acc, item, index) => {
                // console.log(item.data.yearlyamounts.dataset);
                // console.log(Number(item.data.yearlyamounts.dataset[datasetKey]));
                if (isNaN(Number(item.data.yearlyamounts.dataset[datasetKey]))) {
                    return acc;
                } else {

                    if(this.mode === 'subtract' && index > 0) {
                        return acc = acc - Number(item.data.yearlyamounts.dataset[datasetKey]);
                    } else if (this.mode === 'multiply') {
                        return acc = acc * Number(item.data.yearlyamounts.dataset[datasetKey]);
                    } else {
                        return acc = acc + Number(item.data.yearlyamounts.dataset[datasetKey]);
                    }
                    
                }
                
            }, acc);
        });

        // console.log('sums');
        // console.log(sums);

        let newResult = [];

        newResult.push(test1.result[0]);

        newResult[0].data.yearlyamounts.datasetvalues = sums;


        var result2 = {};
		newResult[0].data.yearlyamounts.datasetkeys.forEach((key, i) => result2[key] = newResult[0].data.yearlyamounts.datasetvalues[i]);
        
        
        newResult[0].data.yearlyamounts.dataset = result2;
        newResult[0].object = "Summakostnader";


        test1.result = newResult;



        // console.log('test1!!!!!');
        // console.log(test1);


       
        this.jsonBuilder(sums);
    }

    jsonBuilder(mappedArr) {
        let whcgObj = {};
        whcgObj.result = [];


        function subDataFactory(item) {
            let dataobj = {};
            for (let i = 0; i < item; i++) {
                Object.assign(dataobj, {
                    [String(i)]: mappedArr[i]
                });
            }

            return dataobj;
        }

        function dataFactory(item) {
            let dataobj = {};

            Object.assign(dataobj, {
                'yearlyamounts': {
                    label: 'kr',
                    dataset: subDataFactory(item)
                }
            });

            return dataobj;
        }

        function resultElementObjFactory() {
            return {
                object: this.name,
                data: dataFactory.call(this, mappedArr.length)
            }
        }

        whcgObj.result.push(resultElementObjFactory.call(this));



        // console.log('whcgObj!!!!');
        // console.log(whcgObj);
        this.whcgjsonoutput = JSON.stringify(whcgObj);

        // console.log(this.whcgjsonoutput);


        // let obj = {};
        // obj.result = [];

        // let labelObj = {};
        // labelObj.label = this.label;
        // console.log(labelObj);

        
        // let keyArr = mappedArr.map((element, index) => {
        //     return 'year' + (index + 1);
        // });

        // let valueArr = mappedArr.map((element, index) => {
        //     return element;
        // });

        // let valueObj = {};
        // keyArr.forEach((key, index) => {
        //     valueObj[key] = valueArr[index];
        // });

        // //merging two objects
        // let testObj = Object.assign(labelObj, valueObj);

        // obj.result[0] = testObj;

        // this.whcgjsonoutput = JSON.stringify(obj);

        //     // console.log('keyArr');
        //     // console.log(keyArr);
        //     // console.log('valueArr');
        //     // console.log(obj); 
    };
            


    // _multiplyFields() {

    //     let assignednodes = this.$.slotid.assignedNodes();
        

    //     let filteredArr = assignednodes.filter(element => {

    //         return element.nodeName === "WHCG-NUMBER-FIELD";
    //     });
    //     let dataArr = filteredArr.map(element => element.__data);
    //     console.log(dataArr);

    //     let undefinedElement = false;

    //     dataArr.forEach(element => {
    //         if (element === undefined) {
    //             undefinedElement = true;
    //         }
    //     }) 

    //     if (!undefinedElement) {
    //         this.outputString = this.arrayMultiplier(dataArr);
    //         this.jsonBuilder(dataArr);
    //     }
        
    // };

    // jsonBuilder(dataArr) {
    //     let obj = {};
    //     obj.result = [];
    //     obj.result.push({});
    //     dataArr.forEach(element => {
    //         obj.result[0][element.label] = element.value;
    //     });
    //     this.whcgjsonoutput = JSON.stringify(obj);
    // };

    // arrayMultiplier(arr) {
    //     return arr.reduce((acc, cur) => {
    //         return acc * Number(cur.value);
    //     }, 1);
    // };

   
}

window.customElements.define('whcg-period-summarizer', WhcgPeriodSummarizer);

exports.WhcgPeriodSummarizer = WhcgPeriodSummarizer;
