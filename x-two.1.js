import { LitElement, html } from '@polymer/lit-element';
import '@vaadin/vaadin-text-field';
import { action } from './actions.js';
import '@whcg/whcg-section-text-input';
import './whcg-select';
import './whcg-number-field-box.js';
import '@whcg/whcg-section-textlong-input-chart';
import '@whcg/whcg-section-chart-text-inputlong';
import '@whcg/whcg-section-textlong-chart-input'
import './whcg-box-container.js';
import './whcg-number-field';
import './whcg-chart.js';


import { whcgJsonMaker, whcgObjMerger, whcgPeriodSummarizer, getRandomColor, whcgChartJsTransformer } from './whcg-functions.js';
import { grid } from './grid.css.js';




export class XTwo extends LitElement {

    update(changedProps) {
        //super.update();
        console.log('changedProps');
        console.log(changedProps);
        if (changedProps.has('testvalue')) {
            console.log('testvalue');
            console.log(this.testvalue);

        }

        if (changedProps.has('whcgInitialEstablishCostOwn')) {
            console.log('whcgInitialEstablishCostOwn!!!');
            console.log(this.whcgInitialEstablishCostOwn);

        }

        if (changedProps.has('whcgInitialEstablishCostPerSqmOwnObj')) {
            console.log('whcgInitialEstablishCostPerSqmOwnObj');
            console.log(this.whcgInitialEstablishCostPerSqmOwnObj)
            if(this.whcgNonCompoundedAreaAmountsOwnObj) {
                let mergeObjs = [this.whcgInitialEstablishCostPerSqmOwnObj, this.whcgNonCompoundedAreaAmountsOwnObj]
    
                let allDefined = true;
                mergeObjs.forEach(whcgObj => {
                    if(whcgObj === undefined) {
                        allDefined = false;
                    }
                });
        
                if (allDefined) {
                    this.whcgInitialEstablishCostOwn = whcgPeriodSummarizer(whcgObjMerger(mergeObjs))
                }
            }
        }

        if (changedProps.has('whcgNonCompoundedAreaAmountsOwnObj')) {
            console.log('whcgNonCompoundedAreaAmountsOwnObj');
            console.log(this.whcgNonCompoundedAreaAmountsOwnObj)
            if(this.whcgInitialEstablishCostPerSqmOwnObj) {
                let mergeObjs = [this.whcgNonCompoundedAreaAmountsOwnObj, this.whcgInitialEstablishCostPerSqmOwnObj]
    
                let allDefined = true;
                mergeObjs.forEach(whcgObj => {
                    if(whcgObj === undefined) {
                        allDefined = false;
                    }
                });
        
                if (allDefined) {
                    this.whcgInitialEstablishCostOwn = whcgPeriodSummarizer(whcgObjMerger(mergeObjs))
                }
            }
        }

        if (changedProps.has('initialAreaAmountOwn')) {
            console.log('initialAreaAmountOwn');
            console.log(this.initialAreaAmountOwn)

            // let data = {
            //     updatedProp: this.initialAreaAmountOwn,
            //     period: '10',
            //     fill: false,
            //     key: '0',
            //     datapackage: 'yearlyamounts',
            //     label: 'kvm',
            //     name: 'Initialt etablerad yta',
            // }

            //this.whcgNonCompoundedAreaAmountsOwnObj = JSON.stringify(whcgJsonMaker(data.name, data.updatedProp, data.period, data.datapackage, data.label, data.key, data.fill))

            // this.whcgNonCompoundedAreaAmountsOwnObj = 'hej';

            // console.log('here...');
            // console.log(this.whcgNonCompoundedAreaAmountsOwnObj);

            // let data = {
            //     updatedProp: this.initialAreaAmountOwn,
            //     whcgObj: 'whcgNonCompoundedAreaAmountsOwnObj',
            //     period: '10',
            //     fill: false,
            //     key: '0',
            //     datapackage: 'yearlyamounts',
            //     label: 'kvm',
            //     name: 'Initialt etablerad yta',
            //     otherProps: [this.whcgInitialEstablishCostPerSqmOwnObj]
            // }
            
            // this.whcgInitialEstablishCostOwn = this._output(data);

            // if(this.whcgInitialEstablishCostOwn != undefined) {
            //     let chartJsvar = whcgChartJsTransformer({whcgObj: this.whcgInitialEstablishCostOwn, datapackage: 'yearlyamounts'})

            //     if(chartJsvar) {
            //         console.log('chartJsvar')
            //         console.log(chartJsvar)
                    
            //         let tmpjson = JSON.stringify(chartJsvar)
            //         console.log(tmpjson);
            //         this.chartJsInitialEstablishCostOwn = 'hej';
            //     }
            // }
        }

        if (changedProps.has('initialEstablishCostPerSqmOwn')) {
            console.log('initialEstablishCostPerSqmOwn');
            console.log(this.initialEstablishCostPerSqmOwn)

            // let data = {
            //     updatedProp: this.initialEstablishCostPerSqmOwn,
            //     period: '10',
            //     fill: false,
            //     key: '0',
            //     datapackage: 'yearlyamounts',
            //     label: 'kr',
            //     name: 'Etableringskostnader per kvm',
            // }

            //this.whcgInitialEstablishCostPerSqmOwnObj = whcgJsonMaker(data.name, data.updatedProp, data.period, data.datapackage, data.label, data.key, data.fill)

            this.setValue('hej');
            


        //     let data = {
        //         updatedProp: this.initialEstablishCostPerSqmOwn,
        //         whcgObj: 'whcgInitialEstablishCostPerSqmOwnObj',
        //         period: '10',
        //         fill: false,
        //         key: '0',
        //         datapackage: 'yearlyamounts',
        //         label: 'kr',
        //         name: 'Etableringskostnader per kvm',
        //         otherWhcgObjs: [this.whcgNonCompoundedAreaAmountsOwnObj]
        //     }
            
        //     this.whcgInitialEstablishCostOwn = this._output(data);

        //     if(this.whcgInitialEstablishCostOwn != undefined) {
        //         let chartJsvar = whcgChartJsTransformer({whcgObj: this.whcgInitialEstablishCostOwn, datapackage: 'yearlyamounts'})

        //         if(chartJsvar) {
        //             console.log('chartJsvar')
        //             console.log(chartJsvar)
                    
        //             let tmpjson = JSON.stringify(chartJsvar)
        //             console.log(tmpjson);
        //             this.chartJsInitialEstablishCostOwn = 'hej';
        //         }
        //     }
          }

          if (changedProps.has('chartJsInitialEstablishCostOwn')) {
            //   console.log('chartJsInitialEstablishCostOwn');
            //   console.log(changedProps);
          }
      }


    //   _output(data) {

    //     this[data.whcgObj] = whcgJsonMaker(data.name, data.updatedProp, data.period, data.datapackage, data.label, data.key, data.fill);

    //     // console.log('this[data.whcgObj]');
    //     // console.log(this[data.whcgObj])

    //     if(data.otherWhcgObjs) {
    //         let mergeObjs = [this[data.whcgObj], ...data.otherWhcgObjs]

    //         let allDefined = true;
    //         mergeObjs.forEach(whcgObj => {
    //             if(whcgObj === undefined) {
    //                 allDefined = false;
    //             }
    //         });
    
    //         if (allDefined) {
    //             return whcgPeriodSummarizer(whcgObjMerger(mergeObjs))
    //         }
    //     }
        
    //     return undefined;
    // }


      setValue(value) {
        this.storeHolder.store.dispatch(action.testvalueValue(value));
      }
    



    static get properties() {
        return {
            whcgInitialEstablishCostPerSqmOwnObj: {type: String},
            storeHolder: {type: Object},
            initialAreaAmountOwn: {type: String},
            initialEstablishCostPerSqmOwn: {type: String},
            kwhOwn: {type: String},
            krPerkwhOwn: {type: String},
            maint1yearOwn: {type: String},
            maint2yearOwn: {type: String},
            maint3yearOwn: {type: String},
            maint4yearOwn: {type: String},
            maint1costOwn: {type: String},
            maint2costOwn: {type: String},
            maint3costOwn: {type: String},
            maint4costOwn: {type: String},
            compoundrateRepairOwn: {type: String},
            initialRepairCostPerSqmOwn: {type: String},
            chartJsInitialEstablishCostOwn: {type: String},
            whcgNonCompoundedAreaAmountsOwnObj: {type: String},
            whcgInitialEstablishCostOwn: {type: String},
            testvalue: {type: String}
        };
    }

    constructor() {
        super();
        // this.period = 10;
        this.testvalue = '';
    }

    render() {
        console.log('CHARTJSON!!');
        console.log(this.chartJsInitialEstablishCostOwn);
        return html`
        ${grid}
        <style>
        </style>
        <div class="grid-12">
            <whcg-section-text-input class="col1span12">
                <span slot="title">INITIAL YTSTORLEK</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" column name="">
                    <whcg-number-field label="Antal kvm" @valueChanged=${this.initialAreaAmountOwnChanged.bind(this)} value=${this.initialAreaAmountOwn} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
            </whcg-section-text-input>


            <whcg-section-textlong-input-chart class="col1span12">
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <span slot="title">INITIAL ETABLERINGSKOSTNAD</span>
                <whcg-number-field-box slot="input" name="Inflation">
                    <whcg-number-field label="Etableringskostnad per kvm" @valueChanged=${this.initialEstablishCostPerSqmOwnChanged.bind(this)} value=${this.initialEstablishCostPerSqmOwn} suffix="kr" placeholder="...antal kr"></whcg-number-field>
                </whcg-number-field-box>
                <!-- <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" value=${this.chartJsInitialEstablishCostOwn}></whcg-chart> -->
            </whcg-section-textlong-input-chart>


            <whcg-section-textlong-input-chart class="col1span12">
                <span slot="title">VÄRMEKOSTNADER</span>
                <span slot="text">Selectedpage sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" column name="">
                    <whcg-number-field label="Antal kWh/kvm/år" @valueChanged=${this.kwhOwnChanged.bind(this)} value=${this.kwhOwn} placeholder="...antal" kind="amount" suffix="kWh"></whcg-number-field>
                    <whcg-number-field label="Kostnad per kWh" @valueChanged=${this.krPerKwhOwnChanged.bind(this)} value=${this.krPerKwhOwn} placeholder="... antal" kind="price" suffix="kr"></whcg-number-field>
                </whcg-number-field-box>
                <!-- <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
                    chartjson="{{chartJsCompoundedHeatCostsOwnJson}}">
                </whcg-chart>  -->
            </whcg-section-textlong-input-chart>


            <whcg-section-chart-text-inputlong class="col1span12">
                <span slot="title">PLANNERAT UNDERHÅLL</span>
                <!-- <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" chartjson="{{chartJsSumMaintenanceAllJson}}">
                </whcg-chart> -->
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-box-container slot="input" name="Underhållsinsatser">
                    <whcg-number-field-box column name="Underhållsinsats 1">
                        <whcg-number-field label="År" @valueChanged=${this.maint1yearOwnChanged.bind(this)} value=${this.maint1yearOwn} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field label="Kostnad" @valueChanged=${this.maint1costOwnChanged.bind(this)} value=${this.maint1costOwn} suffix="kr" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Underhållsinsats 2">
                        <whcg-number-field label="År" @valueChanged=${this.maint2yearOwnChanged.bind(this)} value=${this.maint2yearOwn} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field label="Kostnad" @valueChanged=${this.maint2costOwnChanged.bind(this)} value=${this.maint2costOwn} suffix="kr" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Underhållsinsats 3">
                        <whcg-number-field label="År" @valueChanged=${this.maint3yearOwnChanged.bind(this)} value=${this.maint3yearOwn} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field label="Kostnad" @valueChanged=${this.maint3costOwnChanged.bind(this)} value=${this.maint3costOwn} suffix="kr" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Underhållsinsats 4">
                        <whcg-number-field label="År" @valueChanged=${this.maint4yearOwnChanged.bind(this)} value=${this.maint4yearOwn} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field label="Kostnad" @valueChanged=${this.maint4costOwnChanged.bind(this)} value=${this.maint4costOwn} suffix="kr" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                </whcg-box-container>
            </whcg-section-chart-text-inputlong>

            <whcg-section-textlong-chart-input class="col1span12">
                <span slot="title">KOSTNADER FÖR REPARATIONER OCH LÖPANDE UNDERHÅLL</span>
                <span slot="text">Selectedpage sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <!-- <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
                    chartjson="{{chartJsCompoundedRepairCostsOwnJson}}">
                </whcg-chart>  -->
                <whcg-number-field-box slot="input" column name="" mode="none">
                    <whcg-select label="Kostnadsutveckling" suffix="%" @valueChanged=${this.compoundrateRepairOwnChanged.bind(this)} value=${this.compoundrateRepairOwn} placeholder="...antal procent" jsoninput='[{"value": 0.01, "caption": "1"}, {"value": 0.02, "caption": "2"}, {"value": 0.03, "caption": "2"}, {"value": 0.04, "caption": "4"}, {"value": 0.05, "caption": "5"}, {"value": 0.06, "caption": "6"}, {"value": 0.07, "caption": "7"}, {"value": 0.08, "caption": "8"}, {"value": 0.09, "caption": "9"}, {"value": 0.10, "caption": "10"}]'></whcg-select>
                    <whcg-number-field label="Kostnad per kvm" @valueChanged=${this.initialRepairCostPerSqmOwnChanged.bind(this)} value=${this.initialRepairCostPerSqmOwn} placeholder="... antal" kind="price" suffix="kr"></whcg-number-field>
                </whcg-number-field-box>
            </whcg-section-textlong-input-chart>

        </div>



        <!-- <whcg-json-maker name="Initialt etablerad yta" key="0" value="{{initialAreaAmountOwn}}" datapackage="yearlyamounts" label="kvm" period="{{period}}"
                fill whcgjsonoutput="{{whcgNonCompoundedAreaAmountsOwnJson}}"></whcg-json-maker>
            <whcg-json-maker name="Etableringskostnader per kvm" key="0" value="{{initialEstablishCostPerSqmOwn}}" datapackage="yearlyamounts"
            label="kr" period="{{period}}" whcgjsonoutput="{{whcgInitialEstablishCostPerSqmOwnJson}}"></whcg-json-maker>


        <whcg-json-merger whcgjsonoutput="{{whcgInitialEstablishCostPerSqmAndNonCompoundedAreaAmountsOwnJson}}" whcgjsonarrayinput="[{{whcgInitialEstablishCostPerSqmOwnJson}}, {{whcgNonCompoundedAreaAmountsOwnJson}}]"></whcg-json-merger>
            <whcg-period-summarizer mode="multiply" name="Etableringskostnader" whcgjsonoutput="{{whcgInitialEstablishCostOwn}}" whcgjsoninput="{{whcgInitialEstablishCostPerSqmAndNonCompoundedAreaAmountsOwnJson}}"></whcg-period-summarizer>
        <whcg-chart-feeder whcgjsoninput="[[whcgInitialEstablishCostOwn]]" datapackage="yearlyamounts" chartjs="{{chartJsInitialEstablishCostOwn}}"></whcg-chart-feeder>
         -->
        `
    }


    adder(values) {
        return values.reduce((acc, value) => acc+value, 0);
    }

    valueChanged(e) {
        let newValue = this.$.vdm.__data.value;
        this.dispatchEvent(new CustomEvent('valueChanged', { bubbles: true, composed: true, detail: { value: newValue } }))
      }

    initialAreaAmountOwnChanged(e) {
        this.storeHolder.store.dispatch(action.initialAreaAmountOwnValue(e.detail.value));
    }

    initialEstablishCostPerSqmOwnChanged(e) {
        this.storeHolder.store.dispatch(action.initialEstablishCostPerSqmOwnValue(e.detail.value));
    }

    _stateChanged(state) {
        this.initialAreaAmountOwn = state.initialAreaAmountOwn;
        this.initialEstablishCostPerSqmOwn = state.initialEstablishCostPerSqmOwn;
        this.kwhOwn = state.kwhOwn;
        this.krPerKwhOwn = state.krPerKwhOwn;
        this.maint1yearOwn = state.maint1yearOwn;
        this.maint2yearOwn = state.maint2yearOwn;
        this.maint3yearOwn = state.maint3yearOwn;
        this.maint4yearOwn = state.maint4yearOwn;
        this.maint1costOwn = state.maint1costOwn;
        this.maint2costOwn = state.maint2costOwn;
        this.maint3costOwn = state.maint3costOwn;
        this.maint4costOwn = state.maint4costOwn;
        this.initialRepairCostPerSqmOwn = state.initialRepairCostPerSqmOwn;
        this.compoundrateRepairOwn = state.compoundrateRepairOwn;
        this.testvalue = state.testvalue;
    }

    kwhOwnChanged(e) {
        this.storeHolder.store.dispatch(action.kwhOwnValue(e.detail.value));
    }

    krPerKwhOwnChanged(e) {
        this.storeHolder.store.dispatch(action.krPerKwhOwnValue(e.detail.value));
    }

    maint1costOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint1costOwnValue(e.detail.value));
    }

    maint2costOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint2costOwnValue(e.detail.value));
    }

    maint3costOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint3costOwnValue(e.detail.value));
    }

    maint4costOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint4costOwnValue(e.detail.value));
    }

    maint1yearOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint1yearOwnValue(e.detail.value));
    }

    maint2yearOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint2yearOwnValue(e.detail.value));
    }

    maint3yearOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint3yearOwnValue(e.detail.value));
    }

    maint4yearOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint4yearOwnValue(e.detail.value));
    }

    compoundrateRepairOwnChanged(e) {
        this.storeHolder.store.dispatch(action.compoundrateRepairOwnValue(e.detail.value));
    }

    initialRepairCostPerSqmOwnChanged(e) {
        this.storeHolder.store.dispatch(action.initialRepairCostPerSqmOwnValue(e.detail.value));
    } 
}

customElements.define('x-two', XTwo);
