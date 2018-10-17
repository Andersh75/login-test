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
        this.constructor.props().forEach(prop => this[`${prop.propKey}$`] = new rxjs.BehaviorSubject(0));



        rxjs.combineLatest(this.initialPriceHeatOwn$, this.initialAmountHeatOwn$).subscribe(([initialPriceHeatOwn, initialAmountHeatOwn]) => this.initialCostHeatOwn = singleMultiplier([initialPriceHeatOwn, initialAmountHeatOwn]));
        rxjs.combineLatest(this.initialCostHeatOwn$, this.numberofyears$, this.inflationrate$).subscribe(([initialCostHeatOwn, numberofyears, inflationrate]) => this.costHeatOwnSet = this.setCostHeatOwnSet(initialCostHeatOwn, numberofyears, inflationrate));
        rxjs.combineLatest(this.initialAmountAreaOwn$, this.numberofyears$).subscribe(([initialAmountAreaOwn, numberofyears]) => this.initialAmountAreaOwnSet = this.setInitialAmountAreaOwnSet(initialAmountAreaOwn, numberofyears));
        rxjs.combineLatest(this.costHeatOwnSet$, this.initialAmountAreaOwnSet$).subscribe(([costHeatOwnSet, initialAmountAreaOwnSet]) => this.compondedCostHeatOwnSet = this.setCompondedCostHeatOwnSet(initialAmountAreaOwnSet, costHeatOwnSet));
        rxjs.combineLatest(this.compondedCostHeatOwnSet$).subscribe(([compondedCostHeatOwnSet]) => this.chartJsCompondedCostHeatOwnObj = this.setChartJsCompondedCostHeatOwnObj(compondedCostHeatOwnSet));
        rxjs.combineLatest(this.initialPriceAreaOwn$, this.initialAmountAreaOwn$).subscribe(([initialPriceAreaOwn, initialAmountAreaOwn]) => this.initialCostAreaOwn = singleMultiplier([initialPriceAreaOwn, initialAmountAreaOwn]));
        rxjs.combineLatest(this.initialCostAreaOwn$, this.numberofyears$).subscribe(([initialCostAreaOwn, numberofyears]) => this.costAreaOwnSet = this.setCostAreaOwnSet(initialCostAreaOwn, numberofyears));
        rxjs.combineLatest(this.costAreaOwnSet$).subscribe(([costAreaOwnSet]) => this.chartJsCostAreaOwnObj = this.setChartJsCostAreaOwnObj(costAreaOwnSet));
        rxjs.combineLatest(this.initialPriceRepairOwn$, this.numberofyears$, this.compoundrateRepairOwn$).subscribe(([initialPriceRepairOwn, numberofyears, compoundrateRepairOwn]) => this.priceRepairOwnSet = this.setPriceRepairOwnSet(initialPriceRepairOwn, numberofyears, compoundrateRepairOwn));
        rxjs.combineLatest(this.priceRepairOwnSet$, this.initialAmountAreaOwnSet$).subscribe(([priceRepairOwnSet, initialAmountAreaOwnSet]) => this.compondedCostRepairOwnSet = this.setCompondedCostRepairOwnSet(initialAmountAreaOwnSet, priceRepairOwnSet));
        rxjs.combineLatest(this.compondedCostRepairOwnSet$).subscribe(([compondedCostRepairOwnSet]) => this.chartJsCompoundedCostRepairOwnObj = this.setChartJsCompoundedCostRepairOwnObj(compondedCostRepairOwnSet));        
        rxjs.combineLatest(this.maint1costOwn$, this.maint1yearOwn$, this.numberofyears$).subscribe(([maint1costOwn, maint1yearOwn, numberofyears]) => this.maint1OwnSet = this.setMaint1OwnSet(maint1costOwn, maint1yearOwn, numberofyears));
        rxjs.combineLatest(this.maint2costOwn$, this.maint2yearOwn$, this.numberofyears$).subscribe(([maint2costOwn, maint2yearOwn, numberofyears]) => this.maint2OwnSet = this.setMaint2OwnSet(maint2costOwn, maint2yearOwn, numberofyears));
        rxjs.combineLatest(this.maint3costOwn$, this.maint3yearOwn$, this.numberofyears$).subscribe(([maint3costOwn, maint3yearOwn, numberofyears]) => this.maint3OwnSet = this.setMaint3OwnSet(maint3costOwn, maint3yearOwn, numberofyears));
        rxjs.combineLatest(this.maint4costOwn$, this.maint4yearOwn$, this.numberofyears$).subscribe(([maint4costOwn, maint4yearOwn, numberofyears]) => this.maint4OwnSet = this.setMaint4OwnSet(maint4costOwn, maint4yearOwn, numberofyears));
        rxjs.combineLatest(this.maint1OwnSet$, this.maint2OwnSet$, this.maint3OwnSet$, this.maint4OwnSet$).subscribe(([maint1OwnSet, maint2OwnSet, maint3OwnSet, maint4OwnSet]) => this.maintAllOwnSet = this.setMaintAllOwnSet(maint1OwnSet, maint2OwnSet, maint3OwnSet, maint4OwnSet));
        rxjs.combineLatest(this.maintAllOwnSet$).subscribe(([maintAllOwnSet]) => this.chartJsMaintAllOwnObj = this.setChartJsMaintAllOwnObj(maintAllOwnSet));
    }



    updated(changedProps) {
        super.updated(changedProps);
        changedProps.forEach((value, key) => {
            this.constructor.props().forEach(prop => {
                if(prop.propKey === key) {
                    this[`${prop.propKey}$`].next(this[prop.propKey]);
                }
             });
        });
    }

    
    static get properties() {
        return this.props().reduce((acc, prop) => {
            return {...acc, [prop.propKey]: prop.propValue}
        }, {})
    }

    static props() {
        return [
        { propKey: 'costAreaOwnSet', propValue: {type: Object} },
        { propKey: 'initialCostAreaOwn', propValue: {type: String} },
        { propKey: 'compondedCostHeatOwnSet', propValue: {type: Object} },
        { propKey: 'initialAmountAreaOwnSet', propValue: {type: Object} },
        { propKey: 'costHeatOwnSet', propValue: {type: Object} },
        { propKey: 'initialAmountAreaOwn', propValue: {type: String} },
        { propKey: 'numberofyears', propValue: {type: String} },
        { propKey: 'inflationrate', propValue: {type: String} },
        { propKey: 'initialPriceHeatOwn', propValue: {type: String} },
        { propKey: 'initialPriceAreaOwn', propValue: {type: String} },
        { propKey: 'initialAmountHeatOwn', propValue: {type: String} },
        { propKey: 'initialCostHeatOwn', propValue: {type: String} },
        { propKey: 'initialPriceRepairOwn', propValue: {type: String} },
        { propKey: 'compoundrateRepairOwn', propValue: {type: String} },
        { propKey: 'priceRepairOwnSet', propValue: {type: Object} },
        { propKey: 'compondedCostRepairOwnSet', propValue: {type: Object} },
        { propKey: 'chartJsCompoundedCostRepairOwnObj', propValue: {type: Object} },
        { propKey: 'maint1yearOwn', propValue: {type: String} },
        { propKey: 'maint2yearOwn', propValue: {type: String} },
        { propKey: 'maint3yearOwn', propValue: {type: String} },
        { propKey: 'maint4yearOwn', propValue: {type: String} },
        { propKey: 'maint1costOwn', propValue: {type: String} },
        { propKey: 'maint2costOwn', propValue: {type: String} },
        { propKey: 'maint3costOwn', propValue: {type: String} },
        { propKey: 'maint4costOwn', propValue: {type: String} },
        { propKey: 'maint1OwnSet', propValue: {type: Object} },
        { propKey: 'maint2OwnSet', propValue: {type: Object} },
        { propKey: 'maint3OwnSet', propValue: {type: Object} },
        { propKey: 'maint4OwnSet', propValue: {type: Object} },
        { propKey: 'maintAllOwnSet', propValue: {type: Object} },
        { propKey: 'chartJsMaintAllOwnObj', propValue: {type: Object} },
        { propKey: 'chartJsCostAreaOwnObj', propValue: {type: Object} },
        { propKey: 'chartJsCompondedCostHeatOwnObj', propValue: {type: Object} },
        ]
    };





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

    setPriceRepairOwnSet(initialPriceRepairOwn, numberofyears, compoundrateRepairOwn) {
        let setFactoryData = {
            value: initialPriceRepairOwn,
            period: numberofyears,
            key: 'fill'
        }

        let setCompounderdata = {
            set: setFactory(setFactoryData),
            growthRate: compoundrateRepairOwn
        }
        return setCompounder(setCompounderdata)
    }

    setCompondedCostRepairOwnSet(initialAmountAreaOwnSet, priceRepairOwnSet) {
        let setsPeriodOperatorData = {
            sets: [priceRepairOwnSet, initialAmountAreaOwnSet],
            mode: 'multiply'
        }
    
        return setsPeriodOperator(setsPeriodOperatorData);
    }

    setChartJsCompoundedCostRepairOwnObj(compondedCostRepairOwnSet) {

        let whcgObjMakerData = {
            set: compondedCostRepairOwnSet,
            name: 'Reparationskostnader',
            label: 'kr',
            datapackage: 'yearlyamounts'
        }

        let whcgChartJsTransformerData = {
            whcgObj: whcgObjMaker(whcgObjMakerData), 
            datapackage: 'yearlyamounts'
        }
        
        return whcgChartJsTransformer(whcgChartJsTransformerData)
    }


    setMaint1OwnSet(maint1costOwn, maint1yearOwn, numberofyears) {
        let setFactoryData = {
            value: maint1costOwn,
            period: numberofyears,
            key: maint1yearOwn
        }
        return setFactory(setFactoryData)
    }

    setMaint2OwnSet(maint2costOwn, maint2yearOwn, numberofyears) {
        let setFactoryData = {
            value: maint2costOwn,
            period: numberofyears,
            key: maint2yearOwn
        }
        return setFactory(setFactoryData)
    }

    setMaint3OwnSet(maint3costOwn, maint3yearOwn, numberofyears) {
        let setFactoryData = {
            value: maint3costOwn,
            period: numberofyears,
            key: maint3yearOwn
        }
        return setFactory(setFactoryData)
    }

    setMaint4OwnSet(maint4costOwn, maint4yearOwn, numberofyears) {
        let setFactoryData = {
            value: maint4costOwn,
            period: numberofyears,
            key: maint4yearOwn
        }
        return setFactory(setFactoryData)
    }

    setChartJsMaintAllOwnObj(maintAllOwnSet) {

        let whcgObjMakerData = {
            set: maintAllOwnSet,
            name: 'Kostnader planerat underhåll',
            label: 'kr',
            datapackage: 'yearlyamounts'
        }

        let whcgChartJsTransformerData = {
            whcgObj: whcgObjMaker(whcgObjMakerData), 
            datapackage: 'yearlyamounts'
        }
        
        return whcgChartJsTransformer(whcgChartJsTransformerData)
    }



    setMaintAllOwnSet(maint1OwnSet, maint2OwnSet, maint3OwnSet, maint4OwnSet) {
        let setsPeriodOperatorData = {
            sets: [maint1OwnSet, maint2OwnSet, maint3OwnSet, maint4OwnSet],
            mode: 'add'
        }
    
        return setsPeriodOperator(setsPeriodOperatorData);
    }

    constructor() {
        super();
    }

    render() {
        return html`
        ${grid}
        <style>
        </style>
        <vaadin-button id="button">BUTTON</vaadin-button>
        <div class="grid-12">
            <whcg-section-chart-text-inputlong class="col1span12">
                <span slot="title">PLANERAT UNDERHÅLL</span>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" .value=${this.chartJsMaintAllOwnObj}>
                </whcg-chart>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-box-container slot="input" name="Underhållsinsatser">
                    <whcg-number-field-box column name="Underhållsinsats 1">
                        <whcg-number-field label="År" id="maint1yearOwn" @valueChanged=${this.valueChanged.bind(this)} value=${this.maint1yearOwn} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field label="Kostnad" id="maint1costOwn" @valueChanged=${this.valueChanged.bind(this)} value=${this.maint1costOwn} suffix="kr" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Underhållsinsats 2">
                        <whcg-number-field label="År" id="maint2yearOwn"  @valueChanged=${this.valueChanged.bind(this)} value=${this.maint2yearOwn} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field label="Kostnad" id="maint2costOwn" @valueChanged=${this.valueChanged.bind(this)} value=${this.maint2costOwn} suffix="kr" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Underhållsinsats 3">
                        <whcg-number-field label="År" id="maint3yearOwn"  @valueChanged=${this.valueChanged.bind(this)} value=${this.maint3yearOwn} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field label="Kostnad" id="maint3costOwn" @valueChanged=${this.valueChanged.bind(this)} value=${this.maint3costOwn} suffix="kr" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Underhållsinsats 4">
                        <whcg-number-field label="År" id="maint4yearOwn"  @valueChanged=${this.valueChanged.bind(this)} value=${this.maint4yearOwn} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field label="Kostnad" id="maint4costOwn" @valueChanged=${this.valueChanged.bind(this)} value=${this.maint4costOwn} suffix="kr" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                </whcg-box-container>
            </whcg-section-chart-text-inputlong>
            
            <whcg-section-text-input class="col1span12">
                <span slot="title">INITIAL YTSTORLEK</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" column name="">
                    <whcg-number-field label="Antal kvm" id="initialAmountAreaOwn" @valueChanged=${this.valueChanged.bind(this)} value=${this.initialAmountAreaOwn} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
            </whcg-section-text-input>
            <whcg-section-textlong-input-chart class="col1span12">
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <span slot="title">INITIAL ETABLERINGSKOSTNAD</span>
                <whcg-number-field-box slot="input" name="Inflation">
                    <whcg-number-field label="Etableringskostnad per kvm" id="initialPriceAreaOwn" @valueChanged=${this.valueChanged.bind(this)} value=${this.initialPriceAreaOwn} suffix="kr" placeholder="...antal kr"></whcg-number-field>
                </whcg-number-field-box>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" .value=${this.chartJsCostAreaOwnObj}></whcg-chart>
            </whcg-section-textlong-input-chart>
            <whcg-section-textlong-input-chart class="col1span12">
                <span slot="title">VÄRMEKOSTNADER</span>
                <span slot="text">Selectedpage sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" column name="">
                    <whcg-number-field label="Antal kWh/kvm/år" id="initialAmountHeatOwn" @valueChanged=${this.valueChanged.bind(this)} value=${this.initialAmountHeatOwn} placeholder="...antal" kind="amount" suffix="kWh"></whcg-number-field>
                    <whcg-number-field label="Kostnad per kWh" id="initialPriceHeatOwn" @valueChanged=${this.valueChanged.bind(this)} value=${this.initialPriceHeatOwn} placeholder="... antal" kind="price" suffix="kr"></whcg-number-field>
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
                    <whcg-select label="Kostnadsutveckling" suffix="%" id="compoundrateRepairOwn" @valueChanged=${this.valueChanged.bind(this)} value=${this.compoundrateRepairOwn} placeholder="...antal procent" jsoninput='[{"value": 0.01, "caption": "1"}, {"value": 0.02, "caption": "2"}, {"value": 0.03, "caption": "2"}, {"value": 0.04, "caption": "4"}, {"value": 0.05, "caption": "5"}, {"value": 0.06, "caption": "6"}, {"value": 0.07, "caption": "7"}, {"value": 0.08, "caption": "8"}, {"value": 0.09, "caption": "9"}, {"value": 0.10, "caption": "10"}]'></whcg-select>
                    <whcg-number-field label="Kostnad per kvm" id="initialPriceRepairOwn" @valueChanged=${this.valueChanged.bind(this)} value=${this.initialPriceRepairOwn} placeholder="... antal" kind="price" suffix="kr"></whcg-number-field>
                </whcg-number-field-box>
            </whcg-section-textlong-input-chart>
        </div>
        `
    }

    
    valueChanged(e) {
        this.storeHolder.store.dispatch(action[`${e.path[0].id}Value`](e.detail.value));
    }


    _stateChanged(state) {
        this.constructor.props().forEach(prop => {
            if (this[prop.propKey] !== state[prop.propKey] && state[prop.propKey] != undefined) {
                this[prop.propKey] = state[prop.propKey];
            }
        })
    }

}

customElements.define('x-two', XTwo);




        // this.initialPriceHeatOwn$ = new rxjs.BehaviorSubject(0);
        // this.initialAmountHeatOwn$ = new rxjs.BehaviorSubject(0);
        // this.initialCostHeatOwn$ = new rxjs.BehaviorSubject(0);
        // this.numberofyears$ = new rxjs.BehaviorSubject(0);
        // this.inflationrate$ = new rxjs.BehaviorSubject(0);
        // this.initialAmountAreaOwn$ = new rxjs.BehaviorSubject(0);
        // this.initialPriceAreaOwn$ = new rxjs.BehaviorSubject(0);
        // this.costHeatOwnSet$ = new rxjs.BehaviorSubject(0);
        // this.initialAmountAreaOwnSet$ = new rxjs.BehaviorSubject(0);
        // this.compondedCostHeatOwnSet$ = new rxjs.BehaviorSubject(0);
        // this.initialCostAreaOwn$ = new rxjs.BehaviorSubject(0);
        // this.costAreaOwnSet$ = new rxjs.BehaviorSubject(0);
        // this.initialPriceRepairOwn$ = new rxjs.BehaviorSubject(0);
        // this.compoundrateRepairOwn$ = new rxjs.BehaviorSubject(0);
        // this.priceRepairOwnSet$ = new rxjs.BehaviorSubject(0);
        // this.compondedCostRepairOwnSet$ = new rxjs.BehaviorSubject(0);
        // this.maint1yearOwn$ = new rxjs.BehaviorSubject(0);
        // this.maint2yearOwn$ = new rxjs.BehaviorSubject(0);
        // this.maint3yearOwn$ = new rxjs.BehaviorSubject(0);
        // this.maint4yearOwn$ = new rxjs.BehaviorSubject(0);
        // this.maint1costOwn$ = new rxjs.BehaviorSubject(0);
        // this.maint2costOwn$ = new rxjs.BehaviorSubject(0);
        // this.maint3costOwn$ = new rxjs.BehaviorSubject(0);
        // this.maint4costOwn$ = new rxjs.BehaviorSubject(0);

        // this.maint1OwnSet$ = new rxjs.BehaviorSubject(0);
        // this.maint2OwnSet$ = new rxjs.BehaviorSubject(0);
        // this.maint3OwnSet$ = new rxjs.BehaviorSubject(0);
        // this.maint4OwnSet$ = new rxjs.BehaviorSubject(0);
        // this.maintAllOwnSet$ = new rxjs.BehaviorSubject(0);
        // this.chartJsMaintAllOwnObj = new rxjs.BehaviorSubject(0);
        // this.chartJsCompondedCostHeatOwnObj = new rxjs.BehaviorSubject(0);
        // this.chartJsCostAreaOwnObj = new rxjs.BehaviorSubject(0);




            // static get properties() {
    //     return {
    //         costAreaOwnSet: {type: Object},
    //         initialCostAreaOwn: {type: String},
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
    //         chartJsMaintAllOwnObj: {type: Object},
    //         chartJsCostAreaOwnObj: {type: Object},
    //         chartJsCompondedCostHeatOwnObj: {type: Object},
    //         // initialEstablishCostPerSqmOwn: {type: String},
    //         // storeHolder: {type: Object},
    //     };
    // }


    // updated(changedProps) {
    //     super.updated(changedProps);
    //     if (changedProps.has('initialPriceHeatOwn')) {
    //         this.initialPriceHeatOwn$.next(this.initialPriceHeatOwn);
    //     }

    //     if (changedProps.has('initialAmountHeatOwn')) {
    //         this.initialAmountHeatOwn$.next(this.initialAmountHeatOwn);
    //     }

    //     if (changedProps.has('initialCostHeatOwn')) {
    //         this.initialCostHeatOwn$.next(this.initialCostHeatOwn);
    //     }

    //     if (changedProps.has('numberofyears')) {
    //         this.numberofyears$.next(this.numberofyears);
    //     }

    //     if (changedProps.has('inflationrate')) {
    //         this.inflationrate$.next(this.inflationrate);
    //     }

    //     if (changedProps.has('initialAmountAreaOwn')) {
    //         this.initialAmountAreaOwn$.next(this.initialAmountAreaOwn);
    //     }

    //     if (changedProps.has('initialPriceAreaOwn')) {
    //         this.initialPriceAreaOwn$.next(this.initialPriceAreaOwn);
    //     }

    //     if (changedProps.has('costHeatOwnSet')) {
    //         this.costHeatOwnSet$.next(this.costHeatOwnSet);
    //     }

    //     if (changedProps.has('initialAmountAreaOwnSet')) {
    //         this.initialAmountAreaOwnSet$.next(this.initialAmountAreaOwnSet);
    //     }

    //     if (changedProps.has('compondedCostHeatOwnSet')) {
    //         this.compondedCostHeatOwnSet$.next(this.compondedCostHeatOwnSet);
    //     }

    //     if (changedProps.has('initialCostAreaOwn')) {
    //         this.initialCostAreaOwn$.next(this.initialCostAreaOwn);
    //     }

    //     if (changedProps.has('costAreaOwnSet')) {
    //         this.costAreaOwnSet$.next(this.costAreaOwnSet);
    //     }

    //     if (changedProps.has('initialPriceRepairOwn')) {
    //         this.initialPriceRepairOwn$.next(this.initialPriceRepairOwn);
    //     }

    //     if (changedProps.has('compoundrateRepairOwn')) {
    //         this.compoundrateRepairOwn$.next(this.compoundrateRepairOwn);
    //     }

    //     if (changedProps.has('priceRepairOwnSet')) {
    //         this.priceRepairOwnSet$.next(this.priceRepairOwnSet);
    //     }

    //     if (changedProps.has('compondedCostRepairOwnSet')) {
    //         this.compondedCostRepairOwnSet$.next(this.compondedCostRepairOwnSet);
    //     }

    //     if (changedProps.has('maint1yearOwn')) {
    //         this.maint1yearOwn$.next(this.maint1yearOwn);
    //     }

    //     if (changedProps.has('maint2yearOwn')) {
    //         this.maint2yearOwn$.next(this.maint2yearOwn);
    //     }

    //     if (changedProps.has('maint3yearOwn')) {
    //         this.maint3yearOwn$.next(this.maint3yearOwn);
    //     }

    //     if (changedProps.has('maint4yearOwn')) {
    //         this.maint4yearOwn$.next(this.maint4yearOwn);
    //     }

    //     if (changedProps.has('maint1costOwn')) {
    //         this.maint1costOwn$.next(this.maint1costOwn);
    //     }

    //     if (changedProps.has('maint2costOwn')) {
    //         this.maint2costOwn$.next(this.maint2costOwn);
    //     }

    //     if (changedProps.has('maint3costOwn')) {
    //         this.maint3costOwn$.next(this.maint3costOwn);
    //     }

    //     if (changedProps.has('maint4costOwn')) {
    //         this.maint4costOwn$.next(this.maint4costOwn);
    //     }

    //     if (changedProps.has('maint1OwnSet')) {
    //         this.maint1OwnSet$.next(this.maint1OwnSet);
    //     }

    //     if (changedProps.has('maint2OwnSet')) {
    //         this.maint2OwnSet$.next(this.maint2OwnSet);
    //     }

    //     if (changedProps.has('maint3OwnSet')) {
    //         this.maint3OwnSet$.next(this.maint3OwnSet);
    //     }

    //     if (changedProps.has('maint4OwnSet')) {
    //         this.maint4OwnSet$.next(this.maint4OwnSet);
    //     }

    //     if (changedProps.has('maintAllOwnSet')) {
    //         this.maintAllOwnSet$.next(this.maintAllOwnSet);
    //     }
    // }
