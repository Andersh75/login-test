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
import { setChartJsObj, compoundedSetMaker, setMaker, zipAndOperateSetsFactory, whcgJsonMaker, whcgObjMerger, whcgPeriodOperator, getRandomColor, whcgChartJsTransformer, singleMultiplier, whcgCompounder, setFactory, setsPeriodOperator, setCompounder, whcgObjMaker } from './whcg-functions.js';
import { grid } from './grid.css.js';


export class XTwo extends LitElement {

    firstUpdated(changedProps) {
        this.constructor.props().forEach(prop => this[`${prop.propKey}$`] = new rxjs.BehaviorSubject(0));

        let maintOwns = [
            {
                maintOwnSet: this.maint1OwnSet$,
                maintcostsOwn: this.maint1costOwn$,
                maintyearsOwn: this.maint1yearOwn$
            },
            {
                maintOwnSet: this.maint2OwnSet$,
                maintcostsOwn: this.maint2costOwn$,
                maintyearsOwn: this.maint2yearOwn$
            },
            {
                maintOwnSet: this.maint3OwnSet$,
                maintcostsOwn: this.maint3costOwn$,
                maintyearsOwn: this.maint3yearOwn$
            },
            {
                maintOwnSet: this.maint4OwnSet$,
                maintcostsOwn: this.maint4costOwn$,
                maintyearsOwn: this.maint4yearOwn$
            }
        ]

        maintOwns.forEach((item, i) => {
            rxjs.combineLatest(item.maintcostsOwn, this.numberofyears$, item.maintyearsOwn).subscribe((values) => this[`maint${String(i+1)}OwnSet`] = setMaker({value: values[0], period: values[1], key: values[2]}));
        })

        this.zipAndAddSets = zipAndOperateSetsFactory('add');
        this.zipAndMultiplySets = zipAndOperateSetsFactory('multiply');

        rxjs.combineLatest(this.initialPriceHeatOwn$, this.initialAmountHeatOwn$).subscribe((values) => this.initialCostHeatOwn = singleMultiplier(values));
        rxjs.combineLatest(this.initialPriceAreaOwn$, this.initialAmountAreaOwn$).subscribe((values) => this.initialCostAreaOwn = singleMultiplier(values));

        rxjs.combineLatest(this.initialAmountAreaOwn$, this.numberofyears$).subscribe((values) => this.initialAmountAreaOwnSet = setMaker({value: values[0], period: values[1], key: 'fill'}));
        rxjs.combineLatest(this.initialCostAreaOwn$, this.numberofyears$).subscribe((values) => this.costAreaOwnSet = setMaker({value: values[0], period: values[1], key: '0'}));

        rxjs.combineLatest(this.initialCostHeatOwn$, this.numberofyears$, this.inflationrate$).subscribe((values) => this.costHeatOwnSet = compoundedSetMaker({value: values[0], period: values[1], growthRate: values[2], key: 'fill'}));
        rxjs.combineLatest(this.initialPriceRepairOwn$, this.numberofyears$, this.compoundrateRepairOwn$).subscribe((values) => this.priceRepairOwnSet = compoundedSetMaker({value: values[0], period: values[1], growthRate: values[2], key: 'fill'}));

        rxjs.combineLatest(this.costHeatOwnSet$, this.initialAmountAreaOwnSet$).subscribe((sets) => this.compondedCostHeatOwnSet = this.zipAndMultiplySets(sets));
        rxjs.combineLatest(this.priceRepairOwnSet$, this.initialAmountAreaOwnSet$).subscribe((sets) => this.compondedCostRepairOwnSet = this.zipAndMultiplySets(sets));
        rxjs.combineLatest(...maintOwns.map(item => item.maintOwnSet)).subscribe((sets) => this.maintAllOwnSet = this.zipAndAddSets(sets));

        rxjs.combineLatest(this.compondedCostHeatOwnSet$).subscribe((values) => this.chartJsCompondedCostHeatOwnObj = setChartJsObj({set: values[0], name: 'Värmekostnader', label: 'kr', datapackage: 'yearlyamounts'}));
        rxjs.combineLatest(this.costAreaOwnSet$).subscribe((values) => this.chartJsCostAreaOwnObj = setChartJsObj({set: values[0], name: 'Etableringskostnader', label: 'kr', datapackage: 'yearlyamounts'}));
        rxjs.combineLatest(this.compondedCostRepairOwnSet$).subscribe((values) => this.chartJsCompoundedCostRepairOwnObj = setChartJsObj({set: values[0], name: 'Reparationskostnader', label: 'kr', datapackage: 'yearlyamounts'}));        
        rxjs.combineLatest(this.maintAllOwnSet$).subscribe((values) => this.chartJsMaintAllOwnObj = setChartJsObj({set: values[0], name: 'Kostnader planerat underhåll', label: 'kr', datapackage: 'yearlyamounts'}));
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
        // { propKey: 'list', propValue: {type: Array} },
        ]
    };


    constructor() {
        super();
        this.list = [
            {
                yearid: 'maint1yearOwn',
                yearvalue: this.maint1yearOwn,
                costvalue: this.maint1costOwn,
                costid: 'maint1costOwn'
            },
            {
                yearid: 'maint2yearOwn',
                yearvalue: this.maint2yearOwn,
                costvalue: this.maint2costOwn,
                costid: 'maint2costOwn'
            },
            {
                yearid: 'maint3yearOwn',
                yearvalue: this.maint3yearOwn,
                costvalue: this.maint3costOwn,
                costid: 'maint3costOwn'
            },
            {
                yearid: 'maint4yearOwn',
                yearvalue: this.maint4yearOwn,
                costvalue: this.maint4costOwn,
                costid: 'maint4costOwn'
            }
        ]
    }

    

    render() {
        return html`
        ${grid}
        <style>
        </style>
        <div class="grid-12">
            <whcg-section-chart-text-inputlong class="col1span12">
                <span slot="title">PLANERAT UNDERHÅLL</span>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" .value=${this.chartJsMaintAllOwnObj}>
                </whcg-chart>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-box-container slot="input" name="Underhållsinsatser">
                ${this.list.map((item, index) => {
                    return html`
                        <whcg-number-field-box column name="Underhållsinsats 1">
                            <whcg-number-field label="År" id=${`maint${index+1}yearOwn`} @valueChanged=${this.valueChanged.bind(this)} value=${this[`maint${index+1}yearOwn`]} placeholder="...antal"></whcg-number-field>
                            <whcg-number-field label="Kostnad" id=${`maint${index+1}costOwn`} @valueChanged=${this.valueChanged.bind(this)} value=${this[`maint${index+1}costOwn`]} suffix="kr" placeholder="...antal"></whcg-number-field>
                        </whcg-number-field-box>
                    `
                })}
                    

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




// ${ this.list.map((item) => html`
// <whcg-number-field-box column name="Underhållsinsats">
//     <whcg-number-field label="År" id=${item.yearid} @valueChanged=${this.valueChanged.bind(this)} value=${item.yearvalue} placeholder="...antal"></whcg-number-field>
//     <whcg-number-field label="Kostnad" id=${item.costid} @valueChanged=${this.valueChanged.bind(this)} value=${item.costvalue} suffix="kr" placeholder="...antal"></whcg-number-field>
// </whcg-number-field-box>
// `)}



// ${this.list.map((item, index) => {
//     return html`
//         <vaadin-button id=${`maint${index+1}yearOwn`}>${this[`maint${index+1}yearOwn`]}</vaadin-button>
//     `
// })}


/* <whcg-number-field-box column name="Underhållsinsats 1">
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
</whcg-number-field-box> */