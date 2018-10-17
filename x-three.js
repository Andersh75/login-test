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
// import './whcg-chart';
import './whcg-number-field';
import { grid } from './grid.css.js';
import { setChartJsObj, compoundedSetMaker, setMaker, zipAndOperateSetsFactory, whcgJsonMaker, whcgObjMerger, whcgPeriodOperator, getRandomColor, whcgChartJsTransformer, singleMultiplier, whcgCompounder, setFactory, setsPeriodOperator, setCompounder, whcgObjMaker } from './whcg-functions.js';
import * as rxjs from 'rxjs';


export class XThree extends LitElement {

    firstUpdated(changedProps) {
        this.constructor.props().forEach(prop => this[`${prop.propKey}$`] = new rxjs.BehaviorSubject(0));

        this.zipAndAddSets = zipAndOperateSetsFactory('add');
        this.zipAndMultiplySets = zipAndOperateSetsFactory('multiply');
        this.zipAndSubtractSets = zipAndOperateSetsFactory('subtract');


        let expRents = [
            {
                expRentSet: this.exp1RentSet$,
                expAreaRent: this.exp1area$,
                expYearRent: this.exp1year$
            },
            {
                expRentSet: this.exp2RentSet$,
                expAreaRent: this.exp2area$,
                expYearRent: this.exp2year$
            },
            {
                expRentSet: this.exp3RentSet$,
                expAreaRent: this.exp3area$,
                expYearRent: this.exp3year$
            },
            {
                expRentSet: this.exp4RentSet$,
                expAreaRent: this.exp4area$,
                expYearRent: this.exp4year$
            },
        ]

        let decRents = [
            {
                decRentSet: this.dec1RentSet$,
                decAreaRent: this.dec1area$,
                decYearRent: this.dec1year$
            },
            {
                decRentSet: this.dec2RentSet$,
                decAreaRent: this.dec2area$,
                decYearRent: this.dec2year$
            },
            {
                decRentSet: this.dec3RentSet$,
                decAreaRent: this.dec3area$,
                decYearRent: this.dec3year$
            },
            {
                decRentSet: this.dec4RentSet$,
                decAreaRent: this.dec4area$,
                decYearRent: this.dec4year$
            },
        ]

        expRents.forEach((item, i) => {
            rxjs.combineLatest(item.expAreaRent, this.numberofyears$, item.expYearRent).subscribe((values) => this[`exp${String(i+1)}RentSet`] = setMaker({value: values[0], period: values[1], key: values[2]}));
        })

        decRents.forEach((item, i) => {
            rxjs.combineLatest(item.decAreaRent, this.numberofyears$, item.decYearRent).subscribe((values) => this[`dec${String(i+1)}RentSet`] = setMaker({value: values[0], period: values[1], key: values[2]}));
        })

        rxjs.combineLatest(this.initialPriceHeatRent$, this.initialAmountHeatRent$).subscribe((values) => this.initialCostHeatRent = singleMultiplier(values));
        rxjs.combineLatest(this.initialPriceAreaRent$, this.initialAmountAreaRent$).subscribe((values) => this.initialCostAreaRent = singleMultiplier(values));



        rxjs.combineLatest(this.initialAmountAreaRent$, this.numberofyears$).subscribe(([initialAmountAreaRent, numberofyears]) => this.initialAmountAreaRentSet = setMaker({value: initialAmountAreaRent, period: numberofyears, key: 'fill'}))

  
        rxjs.combineLatest(this.initialCostHeatRent$, this.numberofyears$, this.inflationrate$).subscribe(([initialCostHeatRent, numberofyears, inflationrate]) => this.costHeatRentSet = compoundedSetMaker({value: initialCostHeatRent, period: numberofyears, growthRate: inflationrate, key: 'fill'}));
        rxjs.combineLatest(this.initialCostAreaRent$, this.numberofyears$, this.compoundrateAreaRent$).subscribe(([initialCostAreaRent, numberofyears, compoundrateAreaRent]) => this.costAreaRentSet = compoundedSetMaker({value: initialCostAreaRent, period: numberofyears, growthRate: compoundrateAreaRent, key: 'fill'}));



        rxjs.combineLatest(this.costAreaRentSet$, this.initialAmountAreaRentSet$).subscribe((values) => this.compondedCostAreaRentSet = this.zipAndMultiplySets(values));
        rxjs.combineLatest(this.costHeatRentSet$, this.initialAmountAreaRentSet$).subscribe((values) => this.compondedCostHeatRentSet = this.zipAndMultiplySets(values));

        rxjs.combineLatest(...expRents.map(item => item.expRentSet)).subscribe((values) => this.expAllRentSet = this.zipAndAddSets(values));
        rxjs.combineLatest(...decRents.map(item => item.decRentSet)).subscribe((values) => this.decAllRentSet = this.zipAndAddSets(values));


        rxjs.combineLatest(this.initialAmountAreaRentSet$, this.expAllRentSet$).subscribe((values) => this.bruttoAllRentSet = this.zipAndAddSets(values));
        rxjs.combineLatest(this.bruttoAllRentSet$, this.decAllRentSet$).subscribe((values) => this.nettoAllRentSet = this.zipAndSubtractSets(values));
        

        rxjs.combineLatest(this.compondedCostHeatRentSet$).subscribe((values) => this.chartJsCompondedCostHeatRentObj = setChartJsObj({set: values[0], name: 'Värmekostnader', label: 'kr', datapackage: 'yearlyamounts'}));
        rxjs.combineLatest(this.compondedCostAreaRentSet$).subscribe((values) => this.chartJsCompondedCostAreaRentObj = setChartJsObj({set: values[0], name: 'Hyreskostnader', label: 'kr', datapackage: 'yearlyamounts'})); 
        rxjs.combineLatest(this.expAllRentSet$).subscribe((values) => this.chartJsExpAllRentObj = setChartJsObj({set: values[0], name: 'Expanderad lokalyta', label: 'kvm', datapackage: 'yearlyamounts'}));
        rxjs.combineLatest(this.decAllRentSet$).subscribe((values) => this.chartJsDecAllRentObj = setChartJsObj({set: values[0], name: 'Avvecklad lokalyta', label: 'kvm', datapackage: 'yearlyamounts'}));
        rxjs.combineLatest(this.nettoAllRentSet$).subscribe((values) => this.chartJsNettoAllRentObj = setChartJsObj({set: values[0], name: 'Nettolokalyta', label: 'kvm', datapackage: 'yearlyamounts'}));
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
        { propKey: 'initialAmountAreaRent', propValue: {type: String} },
        { propKey: 'initialAmountHeatRent', propValue: {type: String} },
        { propKey: 'initialPriceHeatRent', propValue: {type: String} },
        { propKey: 'initialCostHeatRent', propValue: {type: String} },
        { propKey: 'costHeatRentSet', propValue: {type: Object} },
        { propKey: 'initialAmountAreaRentSet', propValue: {type: Object} },
        { propKey: 'compondedCostHeatRentSet', propValue: {type: Object} },
        { propKey: 'chartJsCompondedCostHeatRentObj', propValue: {type: Object} },
        { propKey: 'numberofyears', propValue: {type: String} },
        { propKey: 'inflationrate', propValue: {type: String} },
        { propKey: 'initialPriceAreaRent', propValue: {type: String} },
        { propKey: 'compoundrateAreaRent', propValue: {type: String} },
        { propKey: 'chartJsCompondedCostAreaRentObj', propValue: {type: Object} },
        { propKey: 'compondedCostAreaRentSet', propValue: {type: Object} },
        { propKey: 'costAreaRentSet', propValue: {type: Object} },
        { propKey: 'initialCostAreaRent', propValue: {type: String} },
        { propKey: 'exp1year', propValue: {type: String} },
        { propKey: 'exp2year', propValue: {type: String} },
        { propKey: 'exp3year', propValue: {type: String} },
        { propKey: 'exp4year', propValue: {type: String} },
        { propKey: 'exp1area', propValue: {type: String} },
        { propKey: 'exp2area', propValue: {type: String} },
        { propKey: 'exp3area', propValue: {type: String} },
        { propKey: 'exp4area', propValue: {type: String} },
        { propKey: 'dec1year', propValue: {type: String} },
        { propKey: 'dec2year', propValue: {type: String} },
        { propKey: 'dec3year', propValue: {type: String} },
        { propKey: 'dec4year', propValue: {type: String} },
        { propKey: 'dec1area', propValue: {type: String} },
        { propKey: 'dec2area', propValue: {type: String} },
        { propKey: 'dec3area', propValue: {type: String} },
        { propKey: 'dec4area', propValue: {type: String} },
        { propKey: 'exp1RentSet', propValue: {type: Object} },
        { propKey: 'exp2RentSet', propValue: {type: Object} },
        { propKey: 'exp3RentSet', propValue: {type: Object} },
        { propKey: 'exp4RentSet', propValue: {type: Object} },
        { propKey: 'decAllRentSet', propValue: {type: Object} },
        { propKey: 'dec1RentSet', propValue: {type: Object} },
        { propKey: 'dec2RentSet', propValue: {type: Object} },
        { propKey: 'dec3RentSet', propValue: {type: Object} },
        { propKey: 'dec4RentSet', propValue: {type: Object} },
        { propKey: 'expAllRentSet', propValue: {type: Object} },
        { propKey: 'chartJsExpAllRentObj', propValue: {type: Object} },
        { propKey: 'chartJsDecAllRentObj', propValue: {type: Object} },
        { propKey: 'nettoAllRentSet', propValue: {type: Object} },
        { propKey: 'bruttoAllRentSet', propValue: {type: Object} },
        { propKey: 'chartJsNettoAllRentObj', propValue: {type: Object} },
        ]
    };


    constructor() {
        super();
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

    render() {
        return html`
        ${grid}
        <style>
        </style>
        <div class="grid-12">

            <whcg-section-chart-text-inputlong class="col1span12">
                <span slot="title">EXPANSION</span>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" .value=${this.chartJsExpAllRentObj}>
                </whcg-chart>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-box-container slot="input" name="Expansionsfaser">
                    <whcg-number-field-box column name="Expansionsfas 1" mode="none">
                        <whcg-number-field id="exp1year" label="År" @valueChanged=${this.valueChanged.bind(this)} value=${this.exp1year} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field id="exp1area" label="Tillfört antal kvm" @valueChanged=${this.valueChanged.bind(this)} value=${this.exp1area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Expansionsfas 2" mode="none">
                        <whcg-number-field id="exp2year" label="År" @valueChanged=${this.valueChanged.bind(this)} value=${this.exp2year} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field id="exp2area" label="Tillfört antal kvm" @valueChanged=${this.valueChanged.bind(this)} value=${this.exp2area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Expansionsfas 3" mode="none">
                        <whcg-number-field id="exp3year" label="År" @valueChanged=${this.valueChanged.bind(this)} value=${this.exp3year} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field id="exp3area" label="Tillfört antal kvm" @valueChanged=${this.valueChanged.bind(this)} value=${this.exp3area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Expansionsfas 4" mode="none">
                        <whcg-number-field id="exp4year" label="År" @valueChanged=${this.valueChanged.bind(this)} value=${this.exp4year} placeholder="...antal"></whcg-number-field>
                        <whcg-number-field id="exp4area" label="Tillfört antal kvm" @valueChanged=${this.valueChanged.bind(this)} value=${this.exp4area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                    </whcg-number-field-box>
                </whcg-box-container>
            </whcg-section-chart-text-inputlong>



            <whcg-section-chart-text-inputlong class="col1span12">
            <span slot="title">AVVECKLING</span>
            <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
            </span>
            <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" .value=${this.chartJsDecAllRentObj}>
            </whcg-chart>
            <whcg-box-container slot="input" name="Avvecklingsfaser">
                <whcg-number-field-box column name="Avvecklingsfas 1" mode="none">
                    <whcg-number-field id="dec1year" label="År" @valueChanged=${this.valueChanged.bind(this)} value=${this.dec1year} placeholder="...antal"></whcg-number-field>
                    <whcg-number-field id="dec1area" label="Avvecklat antal kvm" @valueChanged=${this.valueChanged.bind(this)} value=${this.dec1area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
                <whcg-number-field-box column name="Avvecklingsfas 2" mode="none">
                    <whcg-number-field id="dec2year" label="År" @valueChanged=${this.valueChanged.bind(this)} value=${this.dec2year} placeholder="...antal"></whcg-number-field>
                    <whcg-number-field id="dec2area" label="Avvecklat antal kvm" @valueChanged=${this.valueChanged.bind(this)} value=${this.dec2area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
                <whcg-number-field-box column name="Avvecklingsfas 3" mode="none">
                    <whcg-number-field id="dec3year" label="År" @valueChanged=${this.valueChanged.bind(this)} value=${this.dec3year} placeholder="...antal"></whcg-number-field>
                    <whcg-number-field id="dec3area" label="Avvecklat antal kvm" @valueChanged=${this.valueChanged.bind(this)} value=${this.dec3area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
                <whcg-number-field-box column name="Avvecklingsfas 4" mode="none">
                    <whcg-number-field id="dec4year" label="År" @valueChanged=${this.valueChanged.bind(this)} value=${this.dec4year} placeholder="...antal"></whcg-number-field>
                    <whcg-number-field id="dec4area" label="Avvecklat antal kvm" @valueChanged=${this.valueChanged.bind(this)} value=${this.dec4area} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
            </whcg-box-container>
            </whcg-section-chart-text-inputlong>
            <whcg-section-text-input class="col1span12">
                <span slot="title">INITIAL YTSTORLEK</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" column name="" mode="none">
                    <whcg-number-field id="initialAmountAreaRent" label="Antal kvm" @valueChanged=${this.valueChanged.bind(this)} value=${this.initialAmountAreaRent} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
            </whcg-section-text-input>

            <whcg-section-textlong-chart-input class="col1span12">
                <span slot="title">TOTAL FÖRHYRD YTA</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
                .value=${this.chartJsNettoAllRentObj}>
                </whcg-chart>
            </whcg-section-textlong-chart-input>

            <whcg-section-textlong-chart-input class="col1span12">
                <span slot="title">HYRESNIVÅ OCH HYRESUTVECKLING</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
                .value=${this.chartJsCompondedCostAreaRentObj}>
                </whcg-chart>
                <whcg-number-field-box slot="input" column name="" mode="none">
                    <whcg-number-field id="initialPriceAreaRent" label="Hyreskostnad per kvm" @valueChanged=${this.valueChanged.bind(this)} value=${this.initialPriceAreaRent} suffix="kr" placeholder="...antal" kind="amount"></whcg-number-field>
                    <whcg-select id="compoundrateAreaRent" label="Hyreshöjningstakt" suffix="%" @valueChanged=${this.valueChanged.bind(this)} value=${this.compoundrateAreaRent} placeholder="...antal procent"
                        jsoninput='[{"value": 0.01, "caption": "1"}, {"value": 0.02, "caption": "2"}, {"value": 0.03, "caption": "2"}, {"value": 0.04, "caption": "4"}, {"value": 0.05, "caption": "5"}, {"value": 0.06, "caption": "6"}, {"value": 0.07, "caption": "7"}, {"value": 0.08, "caption": "8"}, {"value": 0.09, "caption": "9"}, {"value": 0.10, "caption": "10"}]'></whcg-select>
                </whcg-number-field-box>
                </whcg-section-textlong-chart-input>

            <whcg-section-textlong-input-chart class="col1span12">
                <span slot="title">Värmekostnader</span>
                <span slot="text">Selectedpage sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" column name="" mode="none">
                    <whcg-number-field id="initialAmountHeatRent" label="Antal kWh/kvm/år" @valueChanged=${this.valueChanged.bind(this)} value=${this.initialAmountHeatRent} placeholder="...antal" kind="amount" suffix="kWh" valueoutput="{{kwh}}"></whcg-number-field>
                    <whcg-number-field id="initialPriceHeatRent" label="Kostnad per kWh" @valueChanged=${this.valueChanged.bind(this)} value=${this.initialPriceHeatRent} placeholder="... antal" kind="price" suffix="kr" valueoutput="{{krperkwh}}"></whcg-number-field>
                </whcg-number-field-box>
                <whcg-chart slot="chart" type="bar" width="800px" height="450px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
                .value=${this.chartJsCompondedCostHeatRentObj}>
                </whcg-chart> 
            </whcg-section-textlong-input-chart>


        </div>  `
    }
}

customElements.define('x-three', XThree);




 // initialAmountAreaRentChanged(e) {
    //     this.storeHolder.store.dispatch(action.initialAmountAreaRentValue(e.detail.value));
    // }

    // initialAmountHeatRentChanged(e) {
    //     this.storeHolder.store.dispatch(action.initialAmountHeatRentValue(e.detail.value));
    // }

    // initialPriceHeatRentChanged(e) {
    //     this.storeHolder.store.dispatch(action.initialPriceHeatRentValue(e.detail.value));
    // }

    // initialPriceAreaRentChanged(e) {
    //     this.storeHolder.store.dispatch(action.initialPriceAreaRentValue(e.detail.value));
    // }

    // compoundrateAreaRentChanged(e) {
    //     this.storeHolder.store.dispatch(action.compoundrateAreaRentValue(e.detail.value));
    // }



    // exp1yearChanged(e) {
    //     this.storeHolder.store.dispatch(action.exp1yearValue(e.detail.value));
    // }

    // exp2yearChanged(e) {
    //     this.storeHolder.store.dispatch(action.exp2yearValue(e.detail.value));
    // }

    // exp3yearChanged(e) {
    //     this.storeHolder.store.dispatch(action.exp3yearValue(e.detail.value));
    // }

    // exp4yearChanged(e) {
    //     this.storeHolder.store.dispatch(action.exp4yearValue(e.detail.value));
    // }

    // exp1areaChanged(e) {
    //     this.storeHolder.store.dispatch(action.exp1areaValue(e.detail.value));
    // }

    // exp2areaChanged(e) {
    //     this.storeHolder.store.dispatch(action.exp2areaValue(e.detail.value));
    // }

    // exp3areaChanged(e) {
    //     this.storeHolder.store.dispatch(action.exp3areaValue(e.detail.value));
    // }

    // exp4areaChanged(e) {
    //     this.storeHolder.store.dispatch(action.exp4areaValue(e.detail.value));
    // }


    // dec1yearChanged(e) {
    //     this.storeHolder.store.dispatch(action.dec1yearValue(e.detail.value));
    // }

    // dec2yearChanged(e) {
    //     this.storeHolder.store.dispatch(action.dec2yearValue(e.detail.value));
    // }

    // dec3yearChanged(e) {
    //     this.storeHolder.store.dispatch(action.dec3yearValue(e.detail.value));
    // }

    // dec4yearChanged(e) {
    //     this.storeHolder.store.dispatch(action.dec4yearValue(e.detail.value));
    // }

    // dec1areaChanged(e) {
    //     this.storeHolder.store.dispatch(action.dec1areaValue(e.detail.value));
    // }

    // dec2areaChanged(e) {
    //     this.storeHolder.store.dispatch(action.dec2areaValue(e.detail.value));
    // }

    // dec3areaChanged(e) {
    //     this.storeHolder.store.dispatch(action.dec3areaValue(e.detail.value));
    // }

    // dec4areaChanged(e) {
    //     this.storeHolder.store.dispatch(action.dec4areaValue(e.detail.value));
    // }







    // updated(changedProps) {
    //     super.updated(changedProps);
    //     if (changedProps.has('initialAmountAreaRent')) {
    //         this.initialAmountAreaRent$.next(this.initialAmountAreaRent);
    //     }

    //     if (changedProps.has('initialPriceHeatRent')) {
    //         this.initialPriceHeatRent$.next(this.initialPriceHeatRent);
    //     }

    //     if (changedProps.has('initialAmountHeatRent')) {
    //         this.initialAmountHeatRent$.next(this.initialAmountHeatRent);
    //     }

    //     if (changedProps.has('initialCostHeatRent')) {
    //         this.initialCostHeatRent$.next(this.initialCostHeatRent);
    //     }

    //     if (changedProps.has('costHeatRentSet')) {
    //         this.costHeatRentSet$.next(this.costHeatRentSet);
    //     }

    //     if (changedProps.has('initialAmountAreaRentSet')) {
    //         this.initialAmountAreaRentSet$.next(this.initialAmountAreaRentSet);
    //     }

    //     if (changedProps.has('compondedCostHeatRentSet')) {
    //         this.compondedCostHeatRentSet$.next(this.compondedCostHeatRentSet);
    //     }

    //     if (changedProps.has('numberofyears')) {
    //         this.numberofyears$.next(this.numberofyears);
    //     }

    //     if (changedProps.has('inflationrate')) {
    //         this.inflationrate$.next(this.inflationrate);
    //     }

    //     if (changedProps.has('initialPriceAreaRent')) {
    //         this.initialPriceAreaRent$.next(this.initialPriceAreaRent);
    //     }

    //     if (changedProps.has('compoundrateAreaRent')) {
    //         this.compoundrateAreaRent$.next(this.compoundrateAreaRent);
    //     }

    //     if (changedProps.has('costAreaRentSet')) {
    //         this.costAreaRentSet$.next(this.costAreaRentSet);
    //     }

    //     if (changedProps.has('compondedCostAreaRentSet')) {
    //         this.compondedCostAreaRentSet$.next(this.compondedCostAreaRentSet);
    //     }

    //     if (changedProps.has('initialCostAreaRent')) {
    //         this.initialCostAreaRent$.next(this.initialCostAreaRent);
    //     }



    //     if (changedProps.has('exp1year')) {
    //         this.exp1year$.next(this.exp1year);
    //     }

    //     if (changedProps.has('exp2year')) {
    //         this.exp2year$.next(this.exp2year);
    //     }

    //     if (changedProps.has('exp3year')) {
    //         this.exp3year$.next(this.exp3year);
    //     }

    //     if (changedProps.has('exp4year')) {
    //         this.exp4year$.next(this.exp4year);
    //     }

    //     if (changedProps.has('dec1year')) {
    //         this.dec1year$.next(this.dec1year);
    //     }

    //     if (changedProps.has('dec2year')) {
    //         this.dec2year$.next(this.dec2year);
    //     }

    //     if (changedProps.has('dec3year')) {
    //         this.dec3year$.next(this.dec3year);
    //     }

    //     if (changedProps.has('dec4year')) {
    //         this.dec4year$.next(this.dec4year);
    //     }

    //     if (changedProps.has('exp1area')) {
    //         this.exp1area$.next(this.exp1area);
    //     }

    //     if (changedProps.has('exp2area')) {
    //         this.exp2area$.next(this.exp2area);
    //     }

    //     if (changedProps.has('exp3area')) {
    //         this.exp3area$.next(this.exp3area);
    //     }

    //     if (changedProps.has('exp4area')) {
    //         this.exp4area$.next(this.exp4area);
    //     }

    //     if (changedProps.has('dec1area')) {
    //         this.dec1area$.next(this.dec1area);
    //     }

    //     if (changedProps.has('dec2area')) {
    //         this.dec2area$.next(this.dec2area);
    //     }

    //     if (changedProps.has('dec3area')) {
    //         this.dec3area$.next(this.dec3area);
    //     }

    //     if (changedProps.has('dec4area')) {
    //         this.dec4area$.next(this.dec4area);
    //     }




    //     if (changedProps.has('exp1RentSet')) {
    //         this.exp1RentSet$.next(this.exp1RentSet);
    //     }

    //     if (changedProps.has('exp2RentSet')) {
    //         this.exp2RentSet$.next(this.exp2RentSet);
    //     }

    //     if (changedProps.has('exp3RentSet')) {
    //         this.exp3RentSet$.next(this.exp3RentSet);
    //     }

    //     if (changedProps.has('exp4RentSet')) {
    //         this.exp4RentSet$.next(this.exp4RentSet);
    //     }

    //     if (changedProps.has('dec1RentSet')) {
    //         this.dec1RentSet$.next(this.dec1RentSet);
    //     }

    //     if (changedProps.has('dec2RentSet')) {
    //         this.dec2RentSet$.next(this.dec2RentSet);
    //     }

    //     if (changedProps.has('dec3RentSet')) {
    //         this.dec3RentSet$.next(this.dec3RentSet);
    //     }

    //     if (changedProps.has('dec4RentSet')) {
    //         this.dec4RentSet$.next(this.dec4RentSet);
    //     }

    //     if (changedProps.has('decAllRentSet')) {
    //         this.decAllRentSet$.next(this.decAllRentSet);
    //     }

    //     if (changedProps.has('expAllRentSet')) {
    //         this.expAllRentSet$.next(this.expAllRentSet);
    //     }


    //     if (changedProps.has('bruttoAllRentSet')) {
    //         this.bruttoAllRentSet$.next(this.bruttoAllRentSet);
    //     }

    //     if (changedProps.has('nettoAllRentSet')) {
    //         this.nettoAllRentSet$.next(this.nettoAllRentSet);
    //     }



        



    // }



            // this.initialAmountAreaRent$ = new rxjs.BehaviorSubject(0);
        // this.initialPriceHeatRent$ = new rxjs.BehaviorSubject(0);
        // this.initialAmountHeatRent$ = new rxjs.BehaviorSubject(0);
        // this.initialCostHeatRent$ = new rxjs.BehaviorSubject(0);
        // this.costHeatRentSet$ = new rxjs.BehaviorSubject(0);
        // this.initialAmountAreaRentSet$ = new rxjs.BehaviorSubject(0);
        // this.compondedCostHeatRentSet$ = new rxjs.BehaviorSubject(0);
        // this.numberofyears$ = new rxjs.BehaviorSubject(0);
        // this.inflationrate$ = new rxjs.BehaviorSubject(0);
        // this.compoundrateAreaRent$ = new rxjs.BehaviorSubject(0);
        // this.initialPriceAreaRent$ = new rxjs.BehaviorSubject(0);
        // this.costAreaRentSet$ = new rxjs.BehaviorSubject(0);
        // this.compondedCostAreaRentSet$ = new rxjs.BehaviorSubject(0);
        // this.initialCostAreaRent$ = new rxjs.BehaviorSubject(0);
        // this.exp1year$ = new rxjs.BehaviorSubject(0);
        // this.exp2year$ = new rxjs.BehaviorSubject(0);
        // this.exp3year$ = new rxjs.BehaviorSubject(0);
        // this.exp4year$ = new rxjs.BehaviorSubject(0);
        // this.exp1area$ = new rxjs.BehaviorSubject(0);
        // this.exp2area$ = new rxjs.BehaviorSubject(0);
        // this.exp3area$ = new rxjs.BehaviorSubject(0);
        // this.exp4area$ = new rxjs.BehaviorSubject(0);
        // this.dec1year$ = new rxjs.BehaviorSubject(0);
        // this.dec2year$ = new rxjs.BehaviorSubject(0);
        // this.dec3year$ = new rxjs.BehaviorSubject(0);
        // this.dec4year$ = new rxjs.BehaviorSubject(0);
        // this.dec1area$ = new rxjs.BehaviorSubject(0);
        // this.dec2area$ = new rxjs.BehaviorSubject(0);
        // this.dec3area$ = new rxjs.BehaviorSubject(0);
        // this.dec4area$ = new rxjs.BehaviorSubject(0);
        // this.exp1RentSet$ = new rxjs.BehaviorSubject(0);
        // this.exp2RentSet$ = new rxjs.BehaviorSubject(0);
        // this.exp3RentSet$ = new rxjs.BehaviorSubject(0);
        // this.exp4RentSet$ = new rxjs.BehaviorSubject(0);
        // this.dec1RentSet$ = new rxjs.BehaviorSubject(0);
        // this.dec2RentSet$ = new rxjs.BehaviorSubject(0);
        // this.dec3RentSet$ = new rxjs.BehaviorSubject(0);
        // this.dec4RentSet$ = new rxjs.BehaviorSubject(0);

        // this.expAllRentSet$ = new rxjs.BehaviorSubject(0);
        // this.decAllRentSet$ = new rxjs.BehaviorSubject(0);

        // this.bruttoAllRentSet$ = new rxjs.BehaviorSubject(0);
        // this.nettoAllRentSet$ = new rxjs.BehaviorSubject(0);

        





        
        // if (this.initialAmountAreaRent !== state.initialAmountAreaRent) {
        //     this.initialAmountAreaRent = state.initialAmountAreaRent;
        // }

        // if (this.initialAmountHeatRent !== state.initialAmountHeatRent) {
        //     this.initialAmountHeatRent = state.initialAmountHeatRent;
        // }

        // if (this.initialPriceHeatRent !== state.initialPriceHeatRent) {
        //     this.initialPriceHeatRent = state.initialPriceHeatRent;
        // }

        // if (this.numberofyears !== state.numberofyears) {
        //     this.numberofyears = state.numberofyears;
        // }

        // if (this.inflationrate !== state.inflationrate) {
        //     this.inflationrate = state.inflationrate;
        // }

        // if (this.compoundrateAreaRent !== state.compoundrateAreaRent) {
        //     this.compoundrateAreaRent = state.compoundrateAreaRent;
        // }

        // if (this.initialPriceAreaRent !== state.initialPriceAreaRent) {
        //     this.initialPriceAreaRent = state.initialPriceAreaRent;
        // }

        // if (this.exp1year !== state.exp1year) {
        //     this.exp1year = state.exp1year;
        // }

        // if (this.exp2year !== state.exp2year) {
        //     this.exp2year = state.exp2year;
        // }

        // if (this.exp3year !== state.exp3year) {
        //     this.exp3year = state.exp3year;
        // }

        // if (this.exp4year !== state.exp4year) {
        //     this.exp4year = state.exp4year;
        // }

        // if (this.exp1area !== state.exp1area) {
        //     this.exp1area = state.exp1area;
        // }

        // if (this.exp2area !== state.exp2area) {
        //     this.exp2area = state.exp2area;
        // }

        // if (this.exp3area !== state.exp3area) {
        //     this.exp3area = state.exp3area;
        // }

        // if (this.exp4area !== state.exp4area) {
        //     this.exp4area = state.exp4area;
        // }



        // if (this.dec1year !== state.dec1year) {
        //     this.dec1year = state.dec1year;
        // }

        // if (this.dec2year !== state.dec2year) {
        //     this.dec2year = state.dec2year;
        // }

        // if (this.dec3year !== state.dec3year) {
        //     this.dec3year = state.dec3year;
        // }

        // if (this.dec4year !== state.dec4year) {
        //     this.dec4year = state.dec4year;
        // }

        // if (this.dec1area !== state.dec1area) {
        //     this.dec1area = state.dec1area;
        // }

        // if (this.dec2area !== state.dec2area) {
        //     this.dec2area = state.dec2area;
        // }

        // if (this.dec3area !== state.dec3area) {
        //     this.dec3area = state.dec3area;
        // }

        // if (this.dec4area !== state.dec4area) {
        //     this.dec4area = state.dec4area;
        // }



        // static get properties() {
        //     return {
        //         storeHolder: {type: Object},
        //         initialAmountAreaRent: {type: String},
        //         initialAmountHeatRent: {type: String},
        //         initialPriceHeatRent: {type: String},
        //         initialCostHeatRent: {type: String},
        //         costHeatRentSet: {type: Object},
        //         initialAmountAreaRentSet: {type: Object},
        //         compondedCostHeatRentSet: {type: Object},
        //         chartJsCompondedCostHeatRentObj: {type: Object},
        //         numberofyears: {type: String},
        //         inflationrate: {type: String},
        //         initialPriceAreaRent: {type: String},
        //         compoundrateAreaRent: {type: String},
        //         chartJsCompondedCostAreaRentObj: {type: Object},
        //         compondedCostAreaRentSet: {type: Object},
        //         costAreaRentSet: {type: Object},
        //         initialCostAreaRent: {type: String},
        //         exp1year: {type: String},
        //         exp2year: {type: String},
        //         exp3year: {type: String},
        //         exp4year: {type: String},
        //         exp1area: {type: String},
        //         exp2area: {type: String},
        //         exp3area: {type: String},
        //         exp4area: {type: String},
        //         dec1year: {type: String},
        //         dec2year: {type: String},
        //         dec3year: {type: String},
        //         dec4year: {type: String},
        //         dec1area: {type: String},
        //         dec2area: {type: String},
        //         dec3area: {type: String},
        //         dec4area: {type: String},
        //         exp1RentSet: {type: Object},
        //         exp2RentSet: {type: Object},
        //         exp3RentSet: {type: Object},
        //         exp4RentSet: {type: Object},
        //         decAllRentSet: {type: Object},
        //         dec1RentSet: {type: Object},
        //         dec2RentSet: {type: Object},
        //         dec3RentSet: {type: Object},
        //         dec4RentSet: {type: Object},
        //         expAllRentSet: {type: Object},
        //         chartJsExpAllRentObj: {type: Object},
        //         chartJsDecAllRentObj: {type: Object},
        //         nettoAllRentSet: {type: Object},
        //         bruttoAllRentSet: {type: Object},
        //         chartJsNettoAllRentObj: {type: Object},
    
        //     };
        // }





    // setChartJsNettoAllRentObj(nettoAllRentSet) {

    //     let whcgObjMakerData = {
    //         set: nettoAllRentSet,
    //         name: 'Nettolokalyta',
    //         label: 'kvm',
    //         datapackage: 'yearlyamounts'
    //     }

    //     let whcgChartJsTransformerData = {
    //         whcgObj: whcgObjMaker(whcgObjMakerData), 
    //         datapackage: 'yearlyamounts'
    //     }
        
    //     return whcgChartJsTransformer(whcgChartJsTransformerData)
    // }

    // setChartJsExpAllRentObj(expAllRentSet) {

    //     let whcgObjMakerData = {
    //         set: expAllRentSet,
    //         name: 'Expanderad lokalyta',
    //         label: 'kvm',
    //         datapackage: 'yearlyamounts'
    //     }

    //     let whcgChartJsTransformerData = {
    //         whcgObj: whcgObjMaker(whcgObjMakerData), 
    //         datapackage: 'yearlyamounts'
    //     }
        
    //     return whcgChartJsTransformer(whcgChartJsTransformerData)
    // }

    // setChartJsDecAllRentObj(decAllRentSet) {

    //     let whcgObjMakerData = {
    //         set: decAllRentSet,
    //         name: 'Avvecklad lokalyta',
    //         label: 'kvm',
    //         datapackage: 'yearlyamounts'
    //     }

    //     let whcgChartJsTransformerData = {
    //         whcgObj: whcgObjMaker(whcgObjMakerData), 
    //         datapackage: 'yearlyamounts'
    //     }
        
    //     return whcgChartJsTransformer(whcgChartJsTransformerData)
    // }



    // setExp1RentSet(exp1costRent, exp1yearRent, numberofyears) {
    //     let setFactoryData = {
    //         value: exp1costRent,
    //         period: numberofyears,
    //         key: exp1yearRent
    //     }
    //     return setFactory(setFactoryData)
    // }

    // setExp2RentSet(exp2costRent, exp2yearRent, numberofyears) {
    //     let setFactoryData = {
    //         value: exp2costRent,
    //         period: numberofyears,
    //         key: exp2yearRent
    //     }
    //     return setFactory(setFactoryData)
    // }

    // setExp3RentSet(exp3costRent, exp3yearRent, numberofyears) {
    //     let setFactoryData = {
    //         value: exp3costRent,
    //         period: numberofyears,
    //         key: exp3yearRent
    //     }
    //     return setFactory(setFactoryData)
    // }

    // setExp4RentSet(exp4costRent, exp4yearRent, numberofyears) {
    //     let setFactoryData = {
    //         value: exp4costRent,
    //         period: numberofyears,
    //         key: exp4yearRent
    //     }
    //     return setFactory(setFactoryData)
    // }


    // setDec1RentSet(dec1costRent, dec1yearRent, numberofyears) {
    //     let setFactoryData = {
    //         value: dec1costRent,
    //         period: numberofyears,
    //         key: dec1yearRent
    //     }
    //     return setFactory(setFactoryData)
    // }

    // setDec2RentSet(dec2costRent, dec2yearRent, numberofyears) {
    //     let setFactoryData = {
    //         value: dec2costRent,
    //         period: numberofyears,
    //         key: dec2yearRent
    //     }
    //     return setFactory(setFactoryData)
    // }

    // setDec3RentSet(dec3costRent, dec3yearRent, numberofyears) {
    //     let setFactoryData = {
    //         value: dec3costRent,
    //         period: numberofyears,
    //         key: dec3yearRent
    //     }
    //     return setFactory(setFactoryData)
    // }

    // setDec4RentSet(dec4costRent, dec4yearRent, numberofyears) {
    //     let setFactoryData = {
    //         value: dec4costRent,
    //         period: numberofyears,
    //         key: dec4yearRent
    //     }
    //     return setFactory(setFactoryData)
    // }


    // setExpAllRentSet(setExp1RentSet, setExp2RentSet, setExp3RentSet, setExp4RentSet) {
    //     let setsPeriodOperatorData = {
    //         sets: [setExp1RentSet, setExp2RentSet, setExp3RentSet, setExp4RentSet],
    //         mode: 'add'
    //     }
    
    //     return setsPeriodOperator(setsPeriodOperatorData);
    // }


    // setDecAllRentSet(setDec1RentSet, setDec2RentSet, setDec3RentSet, setDec4RentSet) {
    //     let setsPeriodOperatorData = {
    //         sets: [setDec1RentSet, setDec2RentSet, setDec3RentSet, setDec4RentSet],
    //         mode: 'add'
    //     }
    
    //     return setsPeriodOperator(setsPeriodOperatorData);
    // }


    // setBruttoAllRentSet(initialAmountAreaRentSet, expAllRentSet) {
    //     let setsPeriodOperatorData = {
    //         sets: [initialAmountAreaRentSet, expAllRentSet],
    //         mode: 'add'
    //     }
    
    //     return setsPeriodOperator(setsPeriodOperatorData);
    // }

    // setNettoAllRentSet(bruttoAllRentSet, decAllRentSet) {
    //     let setsPeriodOperatorData = {
    //         sets: [bruttoAllRentSet, decAllRentSet],
    //         mode: 'subtract'
    //     }
    
    //     return setsPeriodOperator(setsPeriodOperatorData);
    // }




    // setCostHeatRentSet(initialCostHeatRent, numberofyears, inflationrate) {
    //     let setFactoryData = {
    //         value: initialCostHeatRent,
    //         period: numberofyears,
    //         key: 'fill'
    //     }

    //     let setCompounderdata = {
    //         set: setFactory(setFactoryData),
    //         growthRate: inflationrate
    //     }
    //     return setCompounder(setCompounderdata)
    // }



    // setCompondedCostHeatRentSet(initialAmountAreaRentSet, costHeatRentSet) {
    //     let setsPeriodOperatorData = {
    //         sets: [costHeatRentSet, initialAmountAreaRentSet],
    //         mode: 'multiply'
    //     }
    
    //     return setsPeriodOperator(setsPeriodOperatorData);
    // }

    // setChartJsCompondedCostHeatRentObj(compondedCostHeatRentSet) {

    //     let whcgObjMakerData = {
    //         set: compondedCostHeatRentSet,
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





    // setCostAreaRentSet(initialCostAreaRent, numberofyears, inflationrate) {
    //     let setFactoryData = {
    //         value: initialCostAreaRent,
    //         period: numberofyears,
    //         key: 'fill'
    //     }

    //     let setCompounderdata = {
    //         set: setFactory(setFactoryData),
    //         growthRate: inflationrate
    //     }
    //     return setCompounder(setCompounderdata)
    // }

    // setCompondedCostAreaRentSet(initialAmountAreaRentSet, costAreaRentSet) {
    //     let setsPeriodOperatorData = {
    //         sets: [costAreaRentSet, initialAmountAreaRentSet],
    //         mode: 'multiply'
    //     }
    
    //     return setsPeriodOperator(setsPeriodOperatorData);
    // }

    // setChartJsCompondedCostAreaRentObj(compondedCostAreaRentSet) {

    //     let whcgObjMakerData = {
    //         set: compondedCostAreaRentSet,
    //         name: 'Hyreskostnader',
    //         label: 'kr',
    //         datapackage: 'yearlyamounts'
    //     }

    //     let whcgChartJsTransformerData = {
    //         whcgObj: whcgObjMaker(whcgObjMakerData), 
    //         datapackage: 'yearlyamounts'
    //     }
        
    //     return whcgChartJsTransformer(whcgChartJsTransformerData)
    // }