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


import { whcgJsonMaker, whcgObjMerger, whcgPeriodOperator, getRandomColor, whcgChartJsTransformer, whcgMultiplier, whcgCompounder } from './whcg-functions.js';
import { grid } from './grid.css.js';




export class XTwo extends LitElement {

    updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('kwhOwn')) {
            if(this.krPerKwhOwn) {
                let data = {
                    updatedProp: whcgMultiplier([this.kwhOwn, this.krPerKwhOwn]),
                    period: '10',
                    fill: true,
                    key: '0',
                    datapackage: 'yearlyamounts',
                    label: 'kr/kvm',
                    name: 'Värmekostnader per kvm (ej uppräknade)',
                }
    
                this.whcgCompoundedHeatCostsPerSqmOwnObj = whcgCompounder(whcgJsonMaker(data.name, data.updatedProp, data.period, data.datapackage, data.label, data.key, data.fill), 0.03)
            } 
        }

        if (changedProps.has('krPerKwhOwn')) {
            if(this.kwhOwn) {
                let data = {
                    updatedProp: whcgMultiplier([this.kwhOwn, this.krPerKwhOwn]),
                    period: '10',
                    fill: true,
                    key: '0',
                    datapackage: 'yearlyamounts',
                    label: 'kr/kvm',
                    name: 'Värmekostnader per kvm (ej uppräknade)',
                }
    
                this.whcgCompoundedHeatCostsPerSqmOwnObj = whcgCompounder(whcgJsonMaker(data.name, data.updatedProp, data.period, data.datapackage, data.label, data.key, data.fill), 0.03)
            } 
        }

        if (changedProps.has('whcgCompoundedHeatCostsPerSqmOwnObj')) {
            console.log('COMPOUNDER!!!!');
            console.log(this.whcgCompoundedHeatCostsPerSqmOwnObj);


            //YTA NEXT

            //PUT YTA IN COMMON TO STORE IN ORDER TO SHARE PROPERTIES
        }




        if (changedProps.has('initialAreaAmountOwn')) {
            let data = {
                updatedProp: this.initialAreaAmountOwn,
                period: '10',
                fill: false,
                key: '0',
                datapackage: 'yearlyamounts',
                label: 'kvm',
                name: 'Initialt etablerad yta',
            }

            this.whcgNonCompoundedAreaAmountsOwnObj = whcgJsonMaker(data.name, data.updatedProp, data.period, data.datapackage, data.label, data.key, data.fill)
        }

        if (changedProps.has('initialEstablishCostPerSqmOwn')) {
            let data = {
                updatedProp: this.initialEstablishCostPerSqmOwn,
                period: '10',
                fill: false,
                key: '0',
                datapackage: 'yearlyamounts',
                label: 'kr',
                name: 'Etableringskostnader per kvm',
            }

            this.whcgInitialEstablishCostPerSqmOwnObj = whcgJsonMaker(data.name, data.updatedProp, data.period, data.datapackage, data.label, data.key, data.fill)
        }

        if (changedProps.has('whcgNonCompoundedAreaAmountsOwnObj')) {
            if(this.whcgInitialEstablishCostPerSqmOwnObj) {
                this.whcgInitialEstablishCostOwnObj = whcgPeriodOperator(whcgObjMerger([this.whcgNonCompoundedAreaAmountsOwnObj, this.whcgInitialEstablishCostPerSqmOwnObj]), 'multiply', 'Etableringskostnader', 'kr', 'yearlyamounts');
            }
        }

        if (changedProps.has('whcgInitialEstablishCostPerSqmOwnObj')) {
            if(this.whcgNonCompoundedAreaAmountsOwnObj) {
                this.whcgInitialEstablishCostOwnObj = whcgPeriodOperator(whcgObjMerger([this.whcgInitialEstablishCostPerSqmOwnObj, this.whcgNonCompoundedAreaAmountsOwnObj]), 'multiply', 'Etableringskostnader', 'kr', 'yearlyamounts')
            }
        }

        if (changedProps.has('whcgInitialEstablishCostOwnObj')) {
            this.chartJsInitialEstablishCostOwnObj = whcgChartJsTransformer({whcgObj: this.whcgInitialEstablishCostOwnObj, datapackage: 'yearlyamounts'})
        } 
    }

    static get properties() {
        return {
            storeHolder: {type: Object},
            initialAreaAmountOwn: {type: String},
            initialEstablishCostPerSqmOwn: {type: String},
            whcgNonCompoundedAreaAmountsOwnObj: {type: Object},
            whcgInitialEstablishCostPerSqmOwnObj: {type: Object},
            whcgInitialEstablishCostOwnObj: {type: Object},
            chartJsInitialEstablishCostOwnObj: {type: Object},
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
            whcgCompoundedHeatCostsPerSqmOwnObj: {type: Object}
        };
    }

    constructor() {
        super();
    }

    render() {
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
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" .value=${this.chartJsInitialEstablishCostOwnObj}></whcg-chart>
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

        </div>
        `
    }


    initialAreaAmountOwnChanged(e) {
        console.log('initialAreaAmountOwnChanged');
        this.storeHolder.store.dispatch(action.initialAreaAmountOwnValue(e.detail.value));
    }

    initialEstablishCostPerSqmOwnChanged(e) {
        console.log('initialEstablishCostPerSqmOwnChanged');
        this.storeHolder.store.dispatch(action.initialEstablishCostPerSqmOwnValue(e.detail.value));
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


    _stateChanged(state) {
        console.log('stateChanged');
        if (this.initialAreaAmountOwn !== state.initialAreaAmountOwn) {
            this.initialAreaAmountOwn = state.initialAreaAmountOwn;
        }

        if (this.initialEstablishCostPerSqmOwn !== state.initialEstablishCostPerSqmOwn) {
            this.initialEstablishCostPerSqmOwn = state.initialEstablishCostPerSqmOwn;
        }

        if (this.kwhOwn !== state.kwhOwn) {
            this.kwhOwn = state.kwhOwn;
        }

        if (this.krPerKwhOwn !== state.krPerKwhOwn) {
            this.krPerKwhOwn = state.krPerKwhOwn;
        }

        if (this.maint1yearOwn !== state.maint1yearOwn) {
            this.maint1yearOwn = state.maint1yearOwn;
        }

        if (this.maint2yearOwn !== state.maint2yearOwn) {
            this.maint2yearOwn = state.maint2yearOwn;
        }

        if (this.maint3yearOwn !== state.maint3yearOwn) {
            this.maint3yearOwn = state.maint3yearOwn;
        }

        if (this.maint4yearOwn !== state.maint4yearOwn) {
            this.maint4yearOwn = state.maint4yearOwn;
        }

        if (this.maint1costOwn !== state.maint1costOwn) {
            this.maint1costOwn = state.maint1costOwn;
        }

        if (this.maint2costOwn !== state.maint2costOwn) {
            this.maint2costOwn = state.maint2costOwn;
        }

        if (this.maint3costOwn !== state.maint3costOwn) {
            this.maint3costOwn = state.maint3costOwn;
        }

        if (this.maint4costOwn !== state.maint4costOwn) {
            this.maint4costOwn = state.maint4costOwn;
        }

        if (this.initialRepairCostPerSqmOwn !== state.initialRepairCostPerSqmOwn) {
            this.initialRepairCostPerSqmOwn = state.initialRepairCostPerSqmOwn;
        }

        if (this.compoundrateRepairOwn !== state.compoundrateRepairOwn) {
            this.compoundrateRepairOwn = state.compoundrateRepairOwn;
        }
    }

}

customElements.define('x-two', XTwo);
