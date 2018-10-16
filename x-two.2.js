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

    firstUpdated() {
        this.constructor.props().forEach(prop => {if(prop.rx) { this[`${prop.propKey}$`] = new rxjs.BehaviorSubject(this[prop.propKey])}});
        this.initialAmountAreaOwn$.subscribe(x => console.log(`initialAmountAreaOwn: ${x}`));
        this.numberofyears$.subscribe(x => console.log(`numberofyears: ${x}`));
        this.initialPriceAreaOwn$.subscribe(x => console.log(`initialPriceAreaOwn: ${x}`));
        this.initialCostAreaOwn$.subscribe(x => console.log(`initialCostAreaOwn: ${x}`));
        this.costAreaOwnSet$.subscribe(x => console.log(`costAreaOwnSet: ${x}`));
        this.initialAmountAreaOwnSet$.subscribe(x => console.log(`initialAmountAreaOwnSet: ${x}`));

        rxjs.combineLatest(this.initialAmountAreaOwn$, this.numberofyears$).subscribe(([initialAmountAreaOwn, numberofyears]) => this.initialAmountAreaOwnSet = this.setInitialAmountAreaOwnSet(initialAmountAreaOwn, numberofyears));
        rxjs.combineLatest(this.initialPriceAreaOwn$, this.initialAmountAreaOwn$).subscribe(([initialPriceAreaOwn, initialAmountAreaOwn]) => this.initialCostAreaOwn = singleMultiplier([initialPriceAreaOwn, initialAmountAreaOwn]));
        //rxjs.combineLatest(this.initialCostAreaOwn$, this.numberofyears$).subscribe(([initialCostAreaOwn, numberofyears]) => this.costAreaOwnSet = this.setCostAreaOwnSet(initialCostAreaOwn, numberofyears));
        //rxjs.combineLatest(this.costAreaOwnSet$).subscribe(([costAreaOwnSet]) => this.chartJsCostAreaOwnObj = this.setChartJsCostAreaOwnObj(costAreaOwnSet));
        // rxjs.combineLatest(this.initialPriceRepairOwn$, this.numberofyears$, this.compoundrateRepairOwn$).subscribe(([initialPriceRepairOwn, numberofyears, compoundrateRepairOwn]) => this.priceRepairOwnSet = this.setPriceRepairOwnSet(initialPriceRepairOwn, numberofyears, compoundrateRepairOwn));
        // rxjs.combineLatest(this.priceRepairOwnSet$, this.initialAmountAreaOwnSet$).subscribe(([priceRepairOwnSet, initialAmountAreaOwnSet]) => this.compondedCostRepairOwnSet = this.setCompondedCostRepairOwnSet(initialAmountAreaOwnSet, priceRepairOwnSet));
        // rxjs.combineLatest(this.compondedCostRepairOwnSet$).subscribe(([compondedCostRepairOwnSet]) => this.chartJsCompoundedCostRepairOwnObj = this.setChartJsCompoundedCostRepairOwnObj(compondedCostRepairOwnSet));
        // rxjs.combineLatest(this.maint1costOwn$, this.maint1yearOwn$, this.numberofyears$).subscribe(([maint1costOwn, maint1yearOwn, numberofyears]) => this.maint1OwnSet = this.setMaint1OwnSet(maint1costOwn, maint1yearOwn, numberofyears));
        // rxjs.combineLatest(this.maint2costOwn$, this.maint2yearOwn$, this.numberofyears$).subscribe(([maint2costOwn, maint2yearOwn, numberofyears]) => this.maint2OwnSet = this.setMaint2OwnSet(maint2costOwn, maint2yearOwn, numberofyears));
        // rxjs.combineLatest(this.maint3costOwn$, this.maint3yearOwn$, this.numberofyears$).subscribe(([maint3costOwn, maint3yearOwn, numberofyears]) => this.maint3OwnSet = this.setMaint3OwnSet(maint3costOwn, maint3yearOwn, numberofyears));
        // rxjs.combineLatest(this.maint4costOwn$, this.maint4yearOwn$, this.numberofyears$).subscribe(([maint4costOwn, maint4yearOwn, numberofyears]) => this.maint4OwnSet = this.setMaint4OwnSet(maint4costOwn, maint4yearOwn, numberofyears));
        // rxjs.combineLatest(this.maint1OwnSet$, this.maint2OwnSet$, this.maint3OwnSet$, this.maint4OwnSet$).subscribe(([maint1OwnSet, maint2OwnSet, maint3OwnSet, maint4OwnSet]) => this.maintAllOwnSet = this.setMaintAllOwnSet(maint1OwnSet, maint2OwnSet, maint3OwnSet, maint4OwnSet));
        // rxjs.combineLatest(this.maintAllOwnSet$).subscribe(([maintAllOwnSet]) => this.chartJsMaintAllOwnObj = this.setChartJsMaintAllOwnObj(maintAllOwnSet));
        // rxjs.combineLatest(this.costHeatOwnSet$, this.initialAmountAreaOwnSet$).subscribe(([costHeatOwnSet, initialAmountAreaOwnSet]) => this.compondedCostHeatOwnSet = this.setCompondedCostHeatOwnSet(initialAmountAreaOwnSet, costHeatOwnSet));
        // rxjs.combineLatest(this.compondedCostHeatOwnSet$).subscribe(([compondedCostHeatOwnSet]) => this.chartJsCompondedCostHeatOwnObj = this.setChartJsCompondedCostHeatOwnObj(compondedCostHeatOwnSet));
        // rxjs.combineLatest(this.initialPriceHeatOwn$, this.initialAmountHeatOwn$).subscribe(([initialPriceHeatOwn, initialAmountHeatOwn]) => this.initialCostHeatOwn = singleMultiplier([initialPriceHeatOwn, initialAmountHeatOwn]));
        // rxjs.combineLatest(this.initialCostHeatOwn$, this.numberofyears$, this.inflationrate$).subscribe(([initialCostHeatOwn, numberofyears, inflationrate]) => this.costHeatOwnSet = this.setCostHeatOwnSet(initialCostHeatOwn, numberofyears, inflationrate));
    }

    updated(changedProps) {
        super.updated(changedProps);
        console.log('changedProps');
        console.log(changedProps);
        changedProps.forEach((value, key) => {
            this.constructor.props().forEach(prop => {
                if(prop.propKey === key) {
                    console.log('update!');
                    console.log('this')
                    console.log(this)
                    console.log(prop.propKey);
                    console.log(this[prop.propKey]);
                    this[`${prop.propKey}$`].next(this[prop.propKey]);
                }
             });
        });
    }


    static props() {
        return [
            {propKey: 'costAreaOwnSet', propValue: {type: Object}, rx: true},
            {propKey: 'initialCostAreaOwn', propValue: {type: String}, rx: true},
            {propKey: 'chartJsCostAreaOwnObj', propValue: {type: Object}, rx: false},
            {propKey: 'initialAmountAreaOwnSet', propValue: {type: Object}, rx: true},
            {propKey: 'initialAmountAreaOwn', propValue: {type: String}, rx: true},
            {propKey: 'initialPriceAreaOwn', propValue: {type: String}, rx: true},
            {propKey: 'numberofyears', propValue: {type: String}, rx: true},


            // {propKey: 'inflationrate', propValue: {type: String}},
            // {propKey: 'costHeatOwnSet', propValue: {type: Object}},
            // {propKey: 'initialPriceHeatOwn', propValue: {type: String}},
            // {propKey: 'initialAmountHeatOwn', propValue: {type: String}},
            // {propKey: 'initialCostHeatOwn', propValue: {type: String}},
            // {propKey: 'initialPriceRepairOwn', propValue: {type: String}},
            // {propKey: 'compoundrateRepairOwn', propValue: {type: String}},
            // {propKey: 'priceRepairOwnSet', propValue: {type: Object}},
            // {propKey: 'compondedCostRepairOwnSet', propValue: {type: Object}},
            // {propKey: 'chartJsCompoundedCostRepairOwnObj', propValue: {type: Object}},
            // {propKey: 'maint1yearOwn', propValue: {type: String}},
            // {propKey: 'maint2yearOwn', propValue: {type: String}},
            // {propKey: 'maint3yearOwn', propValue: {type: String}},
            // {propKey: 'maint4yearOwn', propValue: {type: String}},
            // {propKey: 'maint1costOwn', propValue: {type: String}},
            // {propKey: 'maint2costOwn', propValue: {type: String}},
            // {propKey: 'maint3costOwn', propValue: {type: String}},
            // {propKey: 'maint4costOwn', propValue: {type: String}},
            // {propKey: 'maint1OwnSet', propValue: {type: Object}},
            // {propKey: 'maint2OwnSet', propValue: {type: Object}},
            // {propKey: 'maint3OwnSet', propValue: {type: Object}},
            // {propKey: 'maint4OwnSet', propValue: {type: Object}},
            // {propKey: 'maintAllOwnSet', propValue: {type: Object}},
            // {propKey: 'chartJsMaintAllOwnObj', propValue: {type: Object}} 
            // {propKey: 'initialEstablishCostPerSqmOwn', propValue: {type: String}},
            // {propKey: 'chartJsCompondedCostHeatOwnObj', propValue: {type: Object}},
            // {propKey: 'compondedCostHeatOwnSet', propValue: {type: Object}},
        ]
    };

    // valueChanged(e) {
    //     this.storeHolder.store.dispatch(action[`${e.path[0].id}Value`](e.detail.value));
    // }

    // static get properties() {
    //     return {
    //         storeHolder: {type: Object},
    //         costAreaOwnSet: {type: Object},
    //         initialCostAreaOwn: {type: String},
    //         chartJsCostAreaOwnObj: {type: Object},
    //         initialEstablishCostPerSqmOwn: {type: String},
    //         chartJsCompondedCostHeatOwnObj: {type: Object},
    //         compondedCostHeatOwnSet: {type: Object},
    //         initialAmountAreaOwnSet: {type: Object},
    //         costHeatOwnSet: {type: Object},
    //         initialAmountAreaOwn: {type: String},
    //         numberofyears: {type: String},
    //         inflationrate: {type: String},
    //         initialPriceHeatOwn: {type: String},
    //         initialPriceAreaOwn: {type: String},
    //         initialAmountHeatOwn: {type: String},
    //         initialCostHeatOwn: {type: String},
    //         initialPriceRepairOwn: {type: String},
    //         compoundrateRepairOwn: {type: String},
    //         priceRepairOwnSet: {type: Object},
    //         compondedCostRepairOwnSet: {type: Object},
    //         chartJsCompoundedCostRepairOwnObj: {type: Object},
    //         maint1yearOwn: {type: String},
    //         maint2yearOwn: {type: String},
    //         maint3yearOwn: {type: String},
    //         maint4yearOwn: {type: String},
    //         maint1costOwn: {type: String},
    //         maint2costOwn: {type: String},
    //         maint3costOwn: {type: String},
    //         maint4costOwn: {type: String},
    //         maint1OwnSet: {type: Object},
    //         maint2OwnSet: {type: Object},
    //         maint3OwnSet: {type: Object},
    //         maint4OwnSet: {type: Object},
    //         maintAllOwnSet: {type: Object},
    //         chartJsMaintAllOwnObj: {type: Object} 
    //     };
    // }

    static get properties() {
        return this.props().reduce((acc, prop) => {
            return {...acc, [prop.propKey]: prop.propValue}
        })
    }



    setCostAreaOwnSet(initialCostHeatOwn, numberofyears) {
        let setFactoryData = {
            value: initialCostHeatOwn,
            period: numberofyears,
            key: '0'
        }

        let setCompounderdata = {
            set: setFactory(setFactoryData),
            growthRate: '0'
        }
        return setCompounder(setCompounderdata)
    }

    setInitialAmountAreaOwnSet(initialAmountAreaOwn, numberofyears) {
        let setFactoryData = {
            value: initialAmountAreaOwn,
            period: numberofyears,
            key: 'fill'
        }
        let x = setFactory(setFactoryData);
        console.log('InitialAmountAreaOwnSet')
        console.log(x)
        return x
    }

    setChartJsCostAreaOwnObj(costAreaOwnSet) {

        let whcgObjMakerData = {
            set: costAreaOwnSet,
            name: 'Etableringskostnader',
            label: 'kr',
            datapackage: 'yearlyamounts'
        }

        let whcgChartJsTransformerData = {
            whcgObj: whcgObjMaker(whcgObjMakerData), 
            datapackage: 'yearlyamounts'
        }
        
        return whcgChartJsTransformer(whcgChartJsTransformerData)
    }

    // setCostHeatOwnSet(initialCostHeatOwn, numberofyears, inflationrate) {
    //     let setFactoryData = {
    //         value: initialCostHeatOwn,
    //         period: numberofyears,
    //         key: 'fill'
    //     }

    //     let setCompounderdata = {
    //         set: setFactory(setFactoryData),
    //         growthRate: inflationrate
    //     }
    //     return setCompounder(setCompounderdata)
    // }

    // setCompondedCostHeatOwnSet(initialAmountAreaOwnSet, costHeatOwnSet) {
    //     console.log('initialAmountAreaOwnSet')
    //     console.log(initialAmountAreaOwnSet)
    //     console.log('costHeatOwnSet')
    //     console.log(costHeatOwnSet)
    //     let setsPeriodOperatorData = {
    //         sets: [costHeatOwnSet, initialAmountAreaOwnSet],
    //         mode: 'multiply'
    //     }
    
    //     return setsPeriodOperator(setsPeriodOperatorData);
    // }

    // setChartJsCompondedCostHeatOwnObj(compondedCostHeatOwnSet) {

    //     let whcgObjMakerData = {
    //         set: compondedCostHeatOwnSet,
    //         name: 'Värmekostnader',
    //         label: 'kr',
    //         datapackage: 'yearlyamounts'
    //     }

    //     let whcgChartJsTransformerData = {
    //         whcgObj: whcgObjMaker(whcgObjMakerData), 
    //         datapackage: 'yearlyamounts'
    //     }
        
    //     return whcgChartJsTransformer(whcgChartJsTransformerData)
    // }



    // setPriceRepairOwnSet(initialPriceRepairOwn, numberofyears, compoundrateRepairOwn) {
    //     let setFactoryData = {
    //         value: initialPriceRepairOwn,
    //         period: numberofyears,
    //         key: 'fill'
    //     }

    //     let setCompounderdata = {
    //         set: setFactory(setFactoryData),
    //         growthRate: compoundrateRepairOwn
    //     }
    //     return setCompounder(setCompounderdata)
    // }

    // setCompondedCostRepairOwnSet(initialAmountAreaOwnSet, priceRepairOwnSet) {
    //     let setsPeriodOperatorData = {
    //         sets: [priceRepairOwnSet, initialAmountAreaOwnSet],
    //         mode: 'multiply'
    //     }
    
    //     return setsPeriodOperator(setsPeriodOperatorData);
    // }

    // setChartJsCompoundedCostRepairOwnObj(compondedCostRepairOwnSet) {

    //     let whcgObjMakerData = {
    //         set: compondedCostRepairOwnSet,
    //         name: 'Reparationskostnader',
    //         label: 'kr',
    //         datapackage: 'yearlyamounts'
    //     }

    //     let whcgChartJsTransformerData = {
    //         whcgObj: whcgObjMaker(whcgObjMakerData), 
    //         datapackage: 'yearlyamounts'
    //     }
        
    //     return whcgChartJsTransformer(whcgChartJsTransformerData)
    // }


    // setMaint1OwnSet(maint1costOwn, maint1yearOwn, numberofyears) {
    //     let setFactoryData = {
    //         value: maint1costOwn,
    //         period: numberofyears,
    //         key: maint1yearOwn
    //     }
    //     return setFactory(setFactoryData)
    // }

    // setMaint2OwnSet(maint2costOwn, maint2yearOwn, numberofyears) {
    //     let setFactoryData = {
    //         value: maint2costOwn,
    //         period: numberofyears,
    //         key: maint2yearOwn
    //     }
    //     return setFactory(setFactoryData)
    // }

    // setMaint3OwnSet(maint3costOwn, maint3yearOwn, numberofyears) {
    //     let setFactoryData = {
    //         value: maint3costOwn,
    //         period: numberofyears,
    //         key: maint3yearOwn
    //     }
    //     return setFactory(setFactoryData)
    // }

    // setMaint4OwnSet(maint4costOwn, maint4yearOwn, numberofyears) {
    //     let setFactoryData = {
    //         value: maint4costOwn,
    //         period: numberofyears,
    //         key: maint4yearOwn
    //     }
    //     return setFactory(setFactoryData)
    // }

    // setChartJsMaintAllOwnObj(maintAllOwnSet) {

    //     let whcgObjMakerData = {
    //         set: maintAllOwnSet,
    //         name: 'Kostnader planerat underhåll',
    //         label: 'kr',
    //         datapackage: 'yearlyamounts'
    //     }

    //     let whcgChartJsTransformerData = {
    //         whcgObj: whcgObjMaker(whcgObjMakerData), 
    //         datapackage: 'yearlyamounts'
    //     }
        
    //     return whcgChartJsTransformer(whcgChartJsTransformerData)
    // }



    // setMaintAllOwnSet(maint1OwnSet, maint2OwnSet, maint3OwnSet, maint4OwnSet) {
    //     let setsPeriodOperatorData = {
    //         sets: [maint1OwnSet, maint2OwnSet, maint3OwnSet, maint4OwnSet],
    //         mode: 'add'
    //     }
    
    //     return setsPeriodOperator(setsPeriodOperatorData);
    // }

    constructor() {
        super();
//         this.rxprops = ['initialPriceHeatOwn', 'initialAmountHeatOwn', 'initialCostHeatOwn', 'numberofyears', 'inflationrate', 'initialAmountAreaOwn', 'initialPriceAreaOwn', 'costHeatOwnSet', 
//     'initialAmountAreaOwnSet', 'initialPriceAreaOwn', 'costHeatOwnSet', 'initialAmountAreaOwnSet', 'compondedCostHeatOwnSet', 'initialCostAreaOwn', 'costAreaOwnSet', 'initialPriceRepairOwn', 
// 'compoundrateRepairOwn', 'priceRepairOwnSet', 'compondedCostRepairOwnSet', 'maint1yearOwn', 'maint2yearOwn', 'maint3yearOwn', 'maint4yearOwn', 'maint1costOwn', 'maint2costOwn', 'maint3costOwn', 
// 'maint4costOwn', 'maint1OwnSet', 'maint2OwnSet', 'maint3OwnSet', 'maint4OwnSet', 'maintAllOwnSet']
//         this.rxprops.forEach(rxprop => this[`${rxprop}$`] = new rxjs.BehaviorSubject(0));




    
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
                    <whcg-number-field id="initialAmountAreaOwn" label="Antal kvm" @valueChanged=${this.initialAmountAreaOwnChanged.bind(this)} value=${this.initialAmountAreaOwn} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
            </whcg-section-text-input>

            <whcg-section-textlong-input-chart class="col1span12">
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <span slot="title">INITIAL ETABLERINGSKOSTNAD</span>
                <whcg-number-field-box slot="input" name="Inflation">
                    <whcg-number-field label="Etableringskostnad per kvm" @valueChanged=${this.initialPriceAreaOwnChanged.bind(this)} value=${this.initialPriceAreaOwn} suffix="kr" placeholder="...antal kr"></whcg-number-field>
                </whcg-number-field-box>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" .value=${this.chartJsCostAreaOwnObj}></whcg-chart>
            </whcg-section-textlong-input-chart>





        </div>
        `
    }

    

    initialAmountAreaOwnChanged(e) {
        console.log('e');
        console.log(e.path[0].id);
        this.storeHolder.store.dispatch(action[`${e.path[0].id}Value`](e.detail.value));
    }

    initialPriceAreaOwnChanged(e) {
        this.storeHolder.store.dispatch(action.initialPriceAreaOwnValue(e.detail.value));
    }

    // initialAmountHeatOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.initialAmountHeatOwnValue(e.detail.value));
    // }

    // initialPriceHeatOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.initialPriceHeatOwnValue(e.detail.value));
    // }



    // initialPriceRepairOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.initialPriceRepairOwnValue(e.detail.value));
    // }

    // compoundrateRepairOwnChanged(e) {
    //     this.storeHolder.store.dispatch(action.compoundrateRepairOwnValue(e.detail.value));
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


    _stateChanged(state) {
        console.log('stateChanged');
        this.constructor.props().forEach(prop => {
            if (this[prop.propKey] !== state[prop.propKey]) {
                console.log('state[prop.propKey]');
                console.log(prop.propKey);
                console.log(state[prop.propKey]);
                console.log('this');
                console.log(this);
                this[prop.propKey] = state[prop.propKey];
            }
        })

        // if (this.initialAmountAreaOwn !== state.initialAmountAreaOwn) {
        //     this.initialAmountAreaOwn = state.initialAmountAreaOwn;
        // }

        // if (this.initialAmountHeatOwn !== state.initialAmountHeatOwn) {
        //     this.initialAmountHeatOwn = state.initialAmountHeatOwn;
        // }

        // if (this.initialPriceHeatOwn !== state.initialPriceHeatOwn) {
        //     this.initialPriceHeatOwn = state.initialPriceHeatOwn;
        // }

        // if (this.inflationrate !== state.inflationrate) {
        //     this.inflationrate = state.inflationrate;
        // }

        // if (this.numberofyears !== state.numberofyears) {
        //     this.numberofyears = state.numberofyears;
        // }

        // if (this.initialPriceAreaOwn !== state.initialPriceAreaOwn) {
        //     this.initialPriceAreaOwn = state.initialPriceAreaOwn;
        // }

        // if (this.compoundrateRepairOwn !== state.compoundrateRepairOwn) {
        //     this.compoundrateRepairOwn = state.compoundrateRepairOwn;
        // }

        // if (this.initialPriceRepairOwn !== state.initialPriceRepairOwn) {
        //     this.initialPriceRepairOwn = state.initialPriceRepairOwn;
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
    }

}

customElements.define('x-two', XTwo);




/* <whcg-section-textlong-input-chart class="col1span12">
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

<whcg-section-textlong-chart-input class="col1span12">
<span slot="title">KOSTNADER FÖR REPARATIONER OCH LÖPANDE UNDERHÅLL</span>
<span slot="text">Selectedpage sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
</span>
<whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
.value=${this.chartJsCompoundedCostRepairOwnObj}>
</whcg-chart> 
<whcg-number-field-box slot="input" column name="" mode="none">
    <whcg-select label="Kostnadsutveckling" suffix="%" @valueChanged=${this.compoundrateRepairOwnChanged.bind(this)} value=${this.compoundrateRepairOwn} placeholder="...antal procent" jsoninput='[{"value": 0.01, "caption": "1"}, {"value": 0.02, "caption": "2"}, {"value": 0.03, "caption": "2"}, {"value": 0.04, "caption": "4"}, {"value": 0.05, "caption": "5"}, {"value": 0.06, "caption": "6"}, {"value": 0.07, "caption": "7"}, {"value": 0.08, "caption": "8"}, {"value": 0.09, "caption": "9"}, {"value": 0.10, "caption": "10"}]'></whcg-select>
    <whcg-number-field label="Kostnad per kvm" @valueChanged=${this.initialPriceRepairOwnChanged.bind(this)} value=${this.initialPriceRepairOwn} placeholder="... antal" kind="price" suffix="kr"></whcg-number-field>
</whcg-number-field-box>
</whcg-section-textlong-input-chart> */



/* <whcg-section-chart-text-inputlong class="col1span12">
<span slot="title">PLANERAT UNDERHÅLL</span>
<whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" .value=${this.chartJsMaintAllOwnObj}>
</whcg-chart>
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
</whcg-section-chart-text-inputlong> */




