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
import { mapmv, setChartJsObj, compoundedSetMaker, setMaker, zipAndOperateSetsFactory, whcgJsonMaker, whcgObjMerger, whcgPeriodOperator, getRandomColor, whcgChartJsTransformer, singleMultiplier, whcgCompounder, setFactory, setsPeriodOperator, setCompounder, whcgObjMaker } from './whcg-functions.js';
import { grid } from './grid.css.js';


export class XTwo extends LitElement {

    firstUpdated(changedProps) {
        this.constructor.props().forEach(prop => {
            console.log(prop.rx);
            if(prop.rx) {
                this[`${prop.propKey}$`] = new rxjs.BehaviorSubject(0);
            }
        })


        let maintOwns = [];

        maintOwns.forEach((item, i) => {
            rxjs.combineLatest(item.maintcostsOwn, this.numberofyears$, item.maintyearsOwn).subscribe((values) => this[`maint${String(i+1)}OwnSet`] = setMaker({value: values[0], period: values[1], key: values[2]}));
        })

        var f = (x, y, z) => {
            console.log('z');
            console.log(z);
            return {
                yearid: 'maint' + String(z + 1) + 'yearOwn',
                yearvalue: x,
                costvalue: y,
                costid: 'maint' + String(z + 1) + 'costOwn'
            }
          };
        

        rxjs.combineLatest(this.maintyearsOwn$, this.maintcostsOwn$).subscribe((values) => this.list = mapmv(f, [...values, [0, 1, 2, 3]]));

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
                if(prop.propKey === key && prop.rx) {
                    this[`${prop.propKey}$`].next(this[prop.propKey]);
                }
             });
        });

        if(changedProps.has('maintyearsOwn')) {
            console.log('MYO CHANGED');
        }

        // let maintOwns = [
        //     {
        //         maintOwnSet: this.maint1OwnSet$,
        //         maintcostsOwn: this.maintcostsOwn$[0],
        //         maintyearsOwn: this.maintyearsOwn$[0]
        //     },
        //     {
        //         maintOwnSet: this.maint2OwnSet$,
        //         maintcostsOwn: this.maintcostsOwn$[1],
        //         maintyearsOwn: this.maintyearsOwn$[1]
        //     },
        //     {
        //         maintOwnSet: this.maint3OwnSet$,
        //         maintcostsOwn: this.maintcostsOwn$[2],
        //         maintyearsOwn: this.maintyearsOwn$[2]
        //     },
        //     {
        //         maintOwnSet: this.maint4OwnSet$,
        //         maintcostsOwn: this.maintcostsOwn$[3],
        //         maintyearsOwn: this.maintyearsOwn$[3]
        //     }
        // ]
    }

    
    static get properties() {
        return this.props().reduce((acc, prop) => {
            return {...acc, [prop.propKey]: prop.propValue}
        }, {})
    }

    static props() {
        return [
        { propKey: 'costAreaOwnSet', propValue: {type: Object}, rx: true },
        { propKey: 'initialCostAreaOwn', propValue: {type: String}, rx: true },
        { propKey: 'compondedCostHeatOwnSet', propValue: {type: Object}, rx: true },
        { propKey: 'initialAmountAreaOwnSet', propValue: {type: Object}, rx: true },
        { propKey: 'costHeatOwnSet', propValue: {type: Object}, rx: true },
        { propKey: 'initialAmountAreaOwn', propValue: {type: String}, rx: true },
        { propKey: 'numberofyears', propValue: {type: String}, rx: true },
        { propKey: 'inflationrate', propValue: {type: String}, rx: true },
        { propKey: 'initialPriceHeatOwn', propValue: {type: String}, rx: true },
        { propKey: 'initialPriceAreaOwn', propValue: {type: String}, rx: true },
        { propKey: 'initialAmountHeatOwn', propValue: {type: String}, rx: true },
        { propKey: 'initialCostHeatOwn', propValue: {type: String}, rx: true },
        { propKey: 'initialPriceRepairOwn', propValue: {type: String}, rx: true },
        { propKey: 'compoundrateRepairOwn', propValue: {type: String}, rx: true },
        { propKey: 'priceRepairOwnSet', propValue: {type: Object}, rx: true },
        { propKey: 'compondedCostRepairOwnSet', propValue: {type: Object}, rx: true },
        { propKey: 'chartJsCompoundedCostRepairOwnObj', propValue: {type: Object}, rx: true },
        { propKey: 'maintyearsOwn', propValue: {type: Array}, rx: true },
        { propKey: 'maintcostsOwn', propValue: {type: Array}, rx: true },
        { propKey: 'maint1yearOwn', propValue: {type: String}, rx: true },
        { propKey: 'maint2yearOwn', propValue: {type: String}, rx: true },
        { propKey: 'maint3yearOwn', propValue: {type: String}, rx: true },
        { propKey: 'maint4yearOwn', propValue: {type: String}, rx: true },
        { propKey: 'maint1costOwn', propValue: {type: String}, rx: true },
        { propKey: 'maint2costOwn', propValue: {type: String}, rx: true },
        { propKey: 'maint3costOwn', propValue: {type: String}, rx: true },
        { propKey: 'maint4costOwn', propValue: {type: String}, rx: true },
        { propKey: 'maint1OwnSet', propValue: {type: Object}, rx: true },
        { propKey: 'maint2OwnSet', propValue: {type: Object}, rx: true },
        { propKey: 'maint3OwnSet', propValue: {type: Object}, rx: true },
        { propKey: 'maint4OwnSet', propValue: {type: Object}, rx: true },
        { propKey: 'maintAllOwnSet', propValue: {type: Object}, rx: true },
        { propKey: 'chartJsMaintAllOwnObj', propValue: {type: Object}, rx: true },
        { propKey: 'chartJsCostAreaOwnObj', propValue: {type: Object}, rx: true },
        { propKey: 'chartJsCompondedCostHeatOwnObj', propValue: {type: Object}, rx: true },
        { propKey: 'list', propValue: {type: Array}, rx: false },
        ]
    };


    constructor() {
        super();
        this.list = [];
    }

    addMaint(e) {
        console.log('CLICKED');
        this.list = [...this.list, {
                yearid: 'maint' + String(this.list.length + 1) + 'yearOwn',
                yearvalue: this['maintyearsOwn'][this.list.length + 1],
                costvalue: this['maintcostsOwn'][this.list.length + 1],
                costid: 'maint' + String(this.list.length + 1) + 'costOwn'
        }]
    }

    removeMaint(e) {
        console.log('CLICKED');
        this.list = [...this.list.slice(0, -1)]
    }

    render() {
        console.log('RENDER');
        console.log(this.list);
        return html`
        ${grid}
        <style>
        </style>
        <vaadin-button id="onemore" @click=${this.addMaint.bind(this)}>ONE MORE</vaadin-button>
        <vaadin-button id="onemore" @click=${this.removeMaint.bind(this)}>ONE Less</vaadin-button>
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
                            <whcg-number-field-box column name=${`Underhållsinsats ${index+1}`}>
                                <whcg-number-field label="År" id=${item.yearid} @valueChanged=${this.valueChanged.bind(this)} value=${item.yearvalue} placeholder="...antal"></whcg-number-field>
                                <whcg-number-field label="Kostnad" id=${item.costid} @valueChanged=${this.valueChanged.bind(this)} value=${item.costvalue} suffix="kr" placeholder="...antal"></whcg-number-field>
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
        console.log('STATE');
        console.log(state);
        this.constructor.props().forEach(prop => {
            if (this[prop.propKey] !== state[prop.propKey] && state[prop.propKey] != undefined) {
                this[prop.propKey] = JSON.parse(state[prop.propKey]);
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