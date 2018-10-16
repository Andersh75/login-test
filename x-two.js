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
import * as rxjs from 'rxjs';
import '@vaadin/vaadin-button';


import { whcgJsonMaker, whcgObjMerger, whcgPeriodOperator, getRandomColor, whcgChartJsTransformer, singleMultiplier, whcgCompounder, setFactory, setsPeriodOperator, setCompounder, whcgObjMaker } from './whcg-functions.js';
import { grid } from './grid.css.js';




export class XTwo extends LitElement {

    firstUpdated(changedProps) {
    }

    updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('initialPriceHeatOwn')) {
            this.initialPriceHeatOwn$.next(this.initialPriceHeatOwn);
        }

        if (changedProps.has('initialAmountHeatOwn')) {
            this.initialAmountHeatOwn$.next(this.initialAmountHeatOwn);
        }

        if (changedProps.has('initialCostHeatOwn')) {
            this.initialCostHeatOwn$.next(this.initialCostHeatOwn);
        }

        if (changedProps.has('numberofyears')) {
            this.numberofyears$.next(this.numberofyears);
        }

        if (changedProps.has('inflationrate')) {
            this.inflationrate$.next(this.inflationrate);
        }

        if (changedProps.has('initialAmountAreaOwn')) {
            this.initialAmountAreaOwn$.next(this.initialAmountAreaOwn);
        }

        if (changedProps.has('costHeatOwnSet')) {
            this.costHeatOwnSet$.next(this.costHeatOwnSet);
        }

        if (changedProps.has('initialAmountAreaOwnSet')) {
            this.initialAmountAreaOwnSet$.next(this.initialAmountAreaOwnSet);
        }

        if (changedProps.has('compondedCostHeatOwnSet')) {
            this.compondedCostHeatOwnSet$.next(this.compondedCostHeatOwnSet);
        }


        // }

        // if (changedProps.has('whcgNonCompoundedAreaAmountsOwnObj')) {
        //     if(this.whcgInitialEstablishCostPerSqmOwnObj) {
        //         this.whcgInitialEstablishCostOwnObj = whcgPeriodOperator(whcgObjMerger([this.whcgNonCompoundedAreaAmountsOwnObj, this.whcgInitialEstablishCostPerSqmOwnObj]), 'multiply', 'Etableringskostnader', 'kr', 'yearlyamounts');
        //     }
        // }

        // if (changedProps.has('whcgInitialEstablishCostPerSqmOwnObj')) {
        //     if(this.whcgNonCompoundedAreaAmountsOwnObj) {
        //         this.whcgInitialEstablishCostOwnObj = whcgPeriodOperator(whcgObjMerger([this.whcgInitialEstablishCostPerSqmOwnObj, this.whcgNonCompoundedAreaAmountsOwnObj]), 'multiply', 'Etableringskostnader', 'kr', 'yearlyamounts')
        //     }
        // }

        // if (changedProps.has('whcgInitialEstablishCostOwnObj')) {
        //     this.chartJsInitialEstablishCostOwnObj = whcgChartJsTransformer({whcgObj: this.whcgInitialEstablishCostOwnObj, datapackage: 'yearlyamounts'})
        // } 

        // if (changedProps.has('whcgCompoundedHeatCostsPerSqmOwnSet')) {
        //     console.log('COMPOUNDER!!!!');
        //     console.log(this.whcgCompoundedHeatCostsPerSqmOwnSet);
        //     console.log('!!numberofyears')
        //     console.log(this.numberofyears);
        //     console.log('setFactory');
        //     console.log(setFactory(this.numberofyears, this.initialAreaAmountOwn, 'fill'));
        //     this.sumAreasOwnSet = setFactory(this.numberofyears, this.initialAreaAmountOwn, 'fill')

        //     setsPeriodOperator([this.whcgCompoundedHeatCostsPerSqmOwnSet, this.whcgSumAreasOwnSet], 'multiply')

        //     //YTA NEXT

        //     //PUT YTA IN COMMON TO STORE IN ORDER TO SHARE PROPERTIES
        // }
    }

    static get properties() {
        return {
            storeHolder: {type: Object},
            // initialAreaAmountOwn: {type: String},
            // initialEstablishCostPerSqmOwn: {type: String},
            
            // whcgNonCompoundedAreaAmountsOwnObj: {type: Object},
            // whcgInitialEstablishCostPerSqmOwnObj: {type: Object},
            // whcgInitialEstablishCostOwnObj: {type: Object},
            // chartJsInitialEstablishCostOwnObj: {type: Object},
            // kwhOwn: {type: String},
            // krPerkwhOwn: {type: String},
            // maint1yearOwn: {type: String},
            // maint2yearOwn: {type: String},
            // maint3yearOwn: {type: String},
            // maint4yearOwn: {type: String},
            // maint1costOwn: {type: String},
            // maint2costOwn: {type: String},
            // maint3costOwn: {type: String},
            // maint4costOwn: {type: String},
            // compoundrateRepairOwn: {type: String},
            // initialRepairCostPerSqmOwn: {type: String},
            // whcgCompoundedHeatCostsPerSqmOwnObj: {type: Object},
            chartJsCompondedCostHeatOwnObj: {type: Object},
            compondedCostHeatOwnSet: {type: Object},
            initialAmountAreaOwnSet: {type: Object},
            costHeatOwnSet: {type: Object},
            initialAmountAreaOwn: {type: String},
            numberofyears: {type: String},
            inflationrate: {type: String},
            initialPriceHeatOwn: {type: String},
            initialAmountHeatOwn: {type: String},
            initialCostHeatOwn: {type: String},



            
        };
    }

    setCostHeatOwnSet(initialCostHeatOwn, numberofyears, inflationrate) {
        let setFactoryData = {
            value: initialCostHeatOwn,
            period: numberofyears,
            key: 'fill'
        }

        let setCompounderdata = {
            set: setFactory(setFactoryData),
            growthRate: inflationrate
        }
        return setCompounder(setCompounderdata)
    }

    setInitialAmountAreaOwnSet(initialAmountAreaOwn, numberofyears) {
        let setFactoryData = {
            value: initialAmountAreaOwn,
            period: numberofyears,
            key: 'fill'
        }
        return setFactory(setFactoryData)
    }

    setCompondedCostHeatOwnSet(initialAmountAreaOwnSet, costHeatOwnSet) {
        let setsPeriodOperatorData = {
            sets: [costHeatOwnSet, initialAmountAreaOwnSet],
            mode: 'multiply'
        }
    
        return setsPeriodOperator(setsPeriodOperatorData);
    }

    setChartJsCompondedCostHeatOwnObj(compondedCostHeatOwnSet) {

        let whcgObjMakerData = {
            set: compondedCostHeatOwnSet,
            name: 'Värmekostnader',
            label: 'kr',
            datapackage: 'yearlyamounts'
        }

        let whcgChartJsTransformerData = {
            whcgObj: whcgObjMaker(whcgObjMakerData), 
            datapackage: 'yearlyamounts'
        }
        
        return whcgChartJsTransformer(whcgChartJsTransformerData)
    }

    constructor() {
        super();
        this.initialPriceHeatOwn$ = new rxjs.BehaviorSubject(0);
        this.initialAmountHeatOwn$ = new rxjs.BehaviorSubject(0);
        this.initialCostHeatOwn$ = new rxjs.BehaviorSubject(0);
        this.numberofyears$ = new rxjs.BehaviorSubject(0);
        this.inflationrate$ = new rxjs.BehaviorSubject(0);
        this.initialAmountAreaOwn$ = new rxjs.BehaviorSubject(0);
        this.costHeatOwnSet$ = new rxjs.BehaviorSubject(0);
        this.initialAmountAreaOwnSet$ = new rxjs.BehaviorSubject(0);
        this.compondedCostHeatOwnSet$ = new rxjs.BehaviorSubject(0);
        rxjs.combineLatest(this.initialPriceHeatOwn$, this.initialAmountHeatOwn$).subscribe(([initialPriceHeatOwn, initialAmountHeatOwn]) => this.initialCostHeatOwn = singleMultiplier([initialPriceHeatOwn, initialAmountHeatOwn]));
        rxjs.combineLatest(this.initialCostHeatOwn$, this.numberofyears$, this.inflationrate$).subscribe(([initialCostHeatOwn, numberofyears, inflationrate]) => this.costHeatOwnSet = this.setCostHeatOwnSet(initialCostHeatOwn, numberofyears, inflationrate));
        rxjs.combineLatest(this.initialAmountAreaOwn$, this.numberofyears$).subscribe(([initialAmountAreaOwn, numberofyears]) => this.initialAmountAreaOwnSet = this.setInitialAmountAreaOwnSet(initialAmountAreaOwn, numberofyears));
        rxjs.combineLatest(this.costHeatOwnSet$, this.initialAmountAreaOwnSet$).subscribe(([costHeatOwnSet, initialAmountAreaOwnSet]) => this.compondedCostHeatOwnSet = this.setCompondedCostHeatOwnSet(initialAmountAreaOwnSet, costHeatOwnSet));
        rxjs.combineLatest(this.compondedCostHeatOwnSet$).subscribe(([compondedCostHeatOwnSet]) => this.chartJsCompondedCostHeatOwnObj = this.setChartJsCompondedCostHeatOwnObj(compondedCostHeatOwnSet));
    }

    render() {
        return html`
        ${grid}
        <style>
        </style>
        <vaadin-button id="button">BUTTON</vaadin-button>
        <div class="grid-12">
            
            <whcg-section-text-input class="col1span12">
                <span slot="title">INITIAL YTSTORLEK</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" column name="">
                    <whcg-number-field label="Antal kvm" @valueChanged=${this.initialAmountAreaOwnChanged.bind(this)} value=${this.initialAmountAreaOwn} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
            </whcg-section-text-input>

            <whcg-section-textlong-input-chart class="col1span12">
                <span slot="title">VÄRMEKOSTNADER</span>
                <span slot="text">Selectedpage sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" column name="">
                    <whcg-number-field label="Antal kWh/kvm/år" @valueChanged=${this.initialAmountHeatOwnChanged.bind(this)} value=${this.initialAmountHeatOwn} placeholder="...antal" kind="amount" suffix="kWh"></whcg-number-field>
                    <whcg-number-field label="Kostnad per kWh" @valueChanged=${this.initialPriceHeatOwnChanged.bind(this)} value=${this.initialPriceHeatOwn} placeholder="... antal" kind="price" suffix="kr"></whcg-number-field>
                </whcg-number-field-box>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
                    .value=${this.chartJsCompondedCostHeatOwnObj}>
                </whcg-chart> 
            </whcg-section-textlong-input-chart>

        </div>
        `
    }

    initialAmountAreaOwnChanged(e) {
        this.storeHolder.store.dispatch(action.initialAmountAreaOwnValue(e.detail.value));
    }

    initialAmountHeatOwnChanged(e) {
        this.storeHolder.store.dispatch(action.initialAmountHeatOwnValue(e.detail.value));
    }

    initialPriceHeatOwnChanged(e) {
        this.storeHolder.store.dispatch(action.initialPriceHeatOwnValue(e.detail.value));
    }






    // initialEstablishCostPerSqmOwnChanged(e) {
    //     console.log('initialEstablishCostPerSqmOwnChanged');
    //     this.storeHolder.store.dispatch(action.initialEstablishCostPerSqmOwnValue(e.detail.value));
    // }



    // maint1costOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.maint1costOwnValue(e.detail.value));
    // }

    // maint2costOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.maint2costOwnValue(e.detail.value));
    // }

    // maint3costOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.maint3costOwnValue(e.detail.value));
    // }

    // maint4costOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.maint4costOwnValue(e.detail.value));
    // }

    // maint1yearOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.maint1yearOwnValue(e.detail.value));
    // }

    // maint2yearOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.maint2yearOwnValue(e.detail.value));
    // }

    // maint3yearOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.maint3yearOwnValue(e.detail.value));
    // }

    // maint4yearOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.maint4yearOwnValue(e.detail.value));
    // }

    // compoundrateRepairOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.compoundrateRepairOwnValue(e.detail.value));
    // }

    // initialRepairCostPerSqmOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.initialRepairCostPerSqmOwnValue(e.detail.value));
    // } 


    _stateChanged(state) {
        console.log('stateChanged');

        if (this.initialAmountAreaOwn !== state.initialAmountAreaOwn) {
            this.initialAmountAreaOwn = state.initialAmountAreaOwn;
        }

        if (this.initialAmountHeatOwn !== state.initialAmountHeatOwn) {
            console.log('state.initialAmountHeatOwn')
            console.log(state.initialAmountHeatOwn)
            console.log('this.initialAmountHeatOwn')
            console.log(this.initialAmountHeatOwn)
            this.initialAmountHeatOwn = state.initialAmountHeatOwn;
        }

        if (this.initialPriceHeatOwn !== state.initialPriceHeatOwn) {
            this.initialPriceHeatOwn = state.initialPriceHeatOwn;
        }

        if (this.inflationrate !== state.inflationrate) {
            this.inflationrate = state.inflationrate;
        }

        if (this.numberofyears !== state.numberofyears) {
            this.numberofyears = state.numberofyears;
        }







        // if (this.initialEstablishCostPerSqmOwn !== state.initialEstablishCostPerSqmOwn) {
        //     this.initialEstablishCostPerSqmOwn = state.initialEstablishCostPerSqmOwn;
        // }



        // if (this.maint1yearOwn !== state.maint1yearOwn) {
        //     this.maint1yearOwn = state.maint1yearOwn;
        // }

        // if (this.maint2yearOwn !== state.maint2yearOwn) {
        //     this.maint2yearOwn = state.maint2yearOwn;
        // }

        // if (this.maint3yearOwn !== state.maint3yearOwn) {
        //     this.maint3yearOwn = state.maint3yearOwn;
        // }

        // if (this.maint4yearOwn !== state.maint4yearOwn) {
        //     this.maint4yearOwn = state.maint4yearOwn;
        // }

        // if (this.maint1costOwn !== state.maint1costOwn) {
        //     this.maint1costOwn = state.maint1costOwn;
        // }

        // if (this.maint2costOwn !== state.maint2costOwn) {
        //     this.maint2costOwn = state.maint2costOwn;
        // }

        // if (this.maint3costOwn !== state.maint3costOwn) {
        //     this.maint3costOwn = state.maint3costOwn;
        // }

        // if (this.maint4costOwn !== state.maint4costOwn) {
        //     this.maint4costOwn = state.maint4costOwn;
        // }

        // if (this.initialRepairCostPerSqmOwn !== state.initialRepairCostPerSqmOwn) {
        //     this.initialRepairCostPerSqmOwn = state.initialRepairCostPerSqmOwn;
        // }

        // if (this.compoundrateRepairOwn !== state.compoundrateRepairOwn) {
        //     this.compoundrateRepairOwn = state.compoundrateRepairOwn;
        // }
    }

}

customElements.define('x-two', XTwo);



                 // let data = {
                //     updatedProp: whcgMultiplier([this.kwhOwn, this.krPerKwhOwn]),
                //     period: this.numberofyears,
                //     fill: true,
                //     key: '0',
                //     datapackage: 'yearlyamounts',
                //     label: 'kr/kvm',
                //     name: 'Värmekostnader per kvm (ej uppräknade)',
                // }
    
                // this.whcgCompoundedHeatCostsPerSqmOwnObj = whcgCompounder(whcgJsonMaker(data.name, data.updatedProp, data.period, data.datapackage, data.label, data.key, data.fill), this.inflationrate)

                // let data = {
                //     updatedProp: whcgMultiplier([this.kwhOwn, this.krPerKwhOwn]),
                //     period: this.numberofyears,
                //     fill: true,
                //     key: '0',
                //     datapackage: 'yearlyamounts',
                //     label: 'kr/kvm',
                //     name: 'Värmekostnader per kvm (ej uppräknade)',
                // }

                // this.whcgCompoundedHeatCostsPerSqmOwnSet = setCompounder(setFactory(whcgMultiplier([this.kwhOwn, this.krPerKwhOwn]), this.numberofyears, 'fill'), this.inflationrate);
    
                //this.whcgCompoundedHeatCostsPerSqmOwnSet = whcgCompounder(whcgJsonMaker(data.name, data.updatedProp, data.period, data.datapackage, data.label, data.key, data.fill), this.inflationrate)

            // let data = {
            //     updatedProp: this.initialAreaAmountOwn,
            //     period: this.numberofyears,
            //     fill: false,
            //     key: '0',
            //     datapackage: 'yearlyamounts',
            //     label: 'kvm',
            //     name: 'Initialt etablerad yta',
            // }

            // this.whcgNonCompoundedAreaAmountsOwnObj = whcgJsonMaker(data.name, data.updatedProp, data.period, data.datapackage, data.label, data.key, data.fill)
            // this.initialCostEstablishOwn = setFactory(this.numberofyears, this.initialAmountAreaOwn, 'fill')
            // let data = {
            //     updatedProp: this.initialEstablishCostPerSqmOwn,
            //     period: this.numberofyears,
            //     fill: false,
            //     key: '0',
            //     datapackage: 'yearlyamounts',
            //     label: 'kr',
            //     name: 'Etableringskostnader per kvm',
            // }

            // this.whcgInitialEstablishCostPerSqmOwnObj = whcgJsonMaker(data.name, data.updatedProp, data.period, data.datapackage, data.label, data.key, data.fill)







        // <whcg-section-textlong-input-chart class="col1span12">
        //     <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
        //     </span>
        //     <span slot="title">INITIAL ETABLERINGSKOSTNAD</span>
        //     <whcg-number-field-box slot="input" name="Inflation">
        //         <whcg-number-field label="Etableringskostnad per kvm" @valueChanged=${this.initialEstablishCostPerSqmOwnChanged.bind(this)} value=${this.initialEstablishCostPerSqmOwn} suffix="kr" placeholder="...antal kr"></whcg-number-field>
        //     </whcg-number-field-box>
        //     <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" .value=${this.chartJsInitialEstablishCostOwnObj}></whcg-chart>
        // </whcg-section-textlong-input-chart>