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
import { whcgJsonMaker, whcgObjMerger, whcgPeriodOperator, getRandomColor, whcgChartJsTransformer, singleMultiplier, whcgCompounder, setFactory, setsPeriodOperator, setCompounder, whcgObjMaker } from './whcg-functions.js';
import * as rxjs from 'rxjs';


export class XThree extends LitElement {

    updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('initialAmountAreaRent')) {
            this.initialAmountAreaRent$.next(this.initialAmountAreaRent);
        }
    }

    constructor() {
        super();
        this.initialAmountAreaRent$ = new rxjs.BehaviorSubject(0);
    }

    static get properties() {
        return {
            storeHolder: {type: Object},
            initialAmountAreaRent: {type: String},
            // exp1year: {type: String},
            // exp2year: {type: String},
            // exp3year: {type: String},
            // exp4year: {type: String},
            // exp1area: {type: String},
            // exp2area: {type: String},
            // exp3area: {type: String},
            // exp4area: {type: String},
            // dec1year: {type: String},
            // dec2year: {type: String},
            // dec3year: {type: String},
            // dec4year: {type: String},
            // dec1area: {type: String},
            // dec2area: {type: String},
            // dec3area: {type: String},
            // dec4area: {type: String},
            // rentincrease: {type: String},
            // initialRentCostPerSqm: {type: String},
            // krperkwh: {type: String},
            // kwh: {type: String} 
        };
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
                <whcg-number-field-box slot="input" column name="" mode="none">
                    <whcg-number-field label="Antal kvm" @valueChanged=${this.initialAmountAreaRentChanged.bind(this)} value=${this.initialAmountAreaRent} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
            </whcg-section-text-input>


        </div>  `
    }


    initialAmountAreaRentChanged(e) {
        this.storeHolder.store.dispatch(action.initialAmountAreaRentValue(e.detail.value));
    }

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





    // initialRentCostPerSqmChanged(e) {
    //     this.storeHolder.store.dispatch(action.initialRentCostPerSqmValue(e.detail.value));
    // }

    // rentincreaseChanged(e) {
    //     this.storeHolder.store.dispatch(action.rentincreaseValue(e.detail.value));
    // }


    // krperkwhChanged(e) {
    //     this.storeHolder.store.dispatch(action.krperkwhValue(e.detail.value));
    // }

    // kwhChanged(e) {
    //     this.storeHolder.store.dispatch(action.kwhValue(e.detail.value));
    // }



    _stateChanged(state) {
        if (this.initialAmountAreaRent !== state.initialAmountAreaRent) {
            this.initialAmountAreaRent = state.initialAmountAreaRent;
        }


        // this.exp1year = state.exp1year;
        // this.exp2year = state.exp2year;
        // this.exp3year = state.exp3year;
        // this.exp4year = state.exp4year;
        // this.exp1area = state.exp1area;
        // this.exp2area = state.exp2area;
        // this.exp3area = state.exp3area;
        // this.exp4area = state.exp4area;

        // this.dec1year = state.dec1year;
        // this.dec2year = state.dec2year;
        // this.dec3year = state.dec3year;
        // this.dec4year = state.dec4year;
        // this.dec1area = state.dec1area;
        // this.dec2area = state.dec2area;
        // this.dec3area = state.dec3area;
        // this.dec4area = state.dec4area;
        // this.initialRentCostPerSqm = state.initialRentCostPerSqm;
        // this.rentincrease = state.rentincrease;
        // this.kwh = state.kwh;
        // this.krperkwh = state.krperkwh;

    }
}

customElements.define('x-three', XThree);




// <whcg-section-chart-text-inputlong class="col1span12">
// <span slot="title">EXPANSION</span>
// <!-- <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" chartjson="{{chartJsSumExpansionAreasJson}}">
// </whcg-chart> -->
// <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
// </span>
// <whcg-box-container slot="input" name="Expansionsfaser">
//     <whcg-number-field-box column name="Expansionsfas 1" mode="none">
//         <whcg-number-field label="År" @valueChanged=${this.exp1yearChanged.bind(this)} value=${this.exp1year} placeholder="...antal"></whcg-number-field>
//         <whcg-number-field label="Tillfört antal kvm" @valueChanged=${this.exp1areaChanged.bind(this)} value=${this.exp1area} suffix="kvm" placeholder="...antal"></whcg-number-field>
//     </whcg-number-field-box>
//     <whcg-number-field-box column name="Expansionsfas 2" mode="none">
//         <whcg-number-field label="År" @valueChanged=${this.exp2yearChanged.bind(this)} value=${this.exp2year} placeholder="...antal"></whcg-number-field>
//         <whcg-number-field label="Tillfört antal kvm" @valueChanged=${this.exp2areaChanged.bind(this)} value=${this.exp2area} suffix="kvm" placeholder="...antal"></whcg-number-field>
//     </whcg-number-field-box>
//     <whcg-number-field-box column name="Expansionsfas 3" mode="none">
//         <whcg-number-field label="År" @valueChanged=${this.exp3yearChanged.bind(this)} value=${this.exp3year} placeholder="...antal"></whcg-number-field>
//         <whcg-number-field label="Tillfört antal kvm" @valueChanged=${this.exp3areaChanged.bind(this)} value=${this.exp3area} suffix="kvm" placeholder="...antal"></whcg-number-field>
//     </whcg-number-field-box>
//     <whcg-number-field-box column name="Expansionsfas 4" mode="none">
//         <whcg-number-field label="År" @valueChanged=${this.exp4yearChanged.bind(this)} value=${this.exp4year} placeholder="...antal"></whcg-number-field>
//         <whcg-number-field label="Tillfört antal kvm" @valueChanged=${this.exp4areaChanged.bind(this)} value=${this.exp4area} suffix="kvm" placeholder="...antal"></whcg-number-field>
//     </whcg-number-field-box>
// </whcg-box-container>
// </whcg-section-chart-text-inputlong>



// <whcg-section-chart-text-inputlong class="col1span12">
// <span slot="title">AVVECKLING</span>
// <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
// </span>
// <!-- <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" chartjson="{{chartJsSumDeclineAreasJson}}">
// </whcg-chart> -->
// <whcg-box-container slot="input" name="Avvecklingsfaser">
//     <whcg-number-field-box column name="Avvecklingsfas 1" mode="none">
//         <whcg-number-field label="År" @valueChanged=${this.dec1yearChanged.bind(this)} value=${this.dec1year} placeholder="...antal"></whcg-number-field>
//         <whcg-number-field label="Avvecklat antal kvm" @valueChanged=${this.dec1areaChanged.bind(this)} value=${this.dec1area} suffix="kvm" placeholder="...antal"></whcg-number-field>
//     </whcg-number-field-box>
//     <whcg-number-field-box column name="Avvecklingsfas 2" mode="none">
//         <whcg-number-field label="År" @valueChanged=${this.dec2yearChanged.bind(this)} value=${this.dec2year} placeholder="...antal"></whcg-number-field>
//         <whcg-number-field label="Avvecklat antal kvm" @valueChanged=${this.dec2areaChanged.bind(this)} value=${this.dec2area} suffix="kvm" placeholder="...antal"></whcg-number-field>
//     </whcg-number-field-box>
//     <whcg-number-field-box column name="Avvecklingsfas 3" mode="none">
//         <whcg-number-field label="År" @valueChanged=${this.dec3yearChanged.bind(this)} value=${this.dec3year} placeholder="...antal"></whcg-number-field>
//         <whcg-number-field label="Avvecklat antal kvm" @valueChanged=${this.dec3areaChanged.bind(this)} value=${this.dec3area} suffix="kvm" placeholder="...antal"></whcg-number-field>
//     </whcg-number-field-box>
//     <whcg-number-field-box column name="Avvecklingsfas 4" mode="none">
//         <whcg-number-field label="År" @valueChanged=${this.dec4yearChanged.bind(this)} value=${this.dec4year} placeholder="...antal"></whcg-number-field>
//         <whcg-number-field label="Avvecklat antal kvm" @valueChanged=${this.dec4areaChanged.bind(this)} value=${this.dec4area} suffix="kvm" placeholder="...antal"></whcg-number-field>
//     </whcg-number-field-box>
// </whcg-box-container>
// </whcg-section-chart-text-inputlong>


// <whcg-section-textlong-chart-input class="col1span12">
// <span slot="title">HYRESNIVÅ OCH HYRESUTVECKLING</span>
// <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
// </span>
// <!-- <whcg-lit-grid slot="chart"></whcg-lit-grid> -->
// <!-- <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
//     chartjson="{{chartJsCompoundedRentCostsJson}}">
// </whcg-chart> -->
// <whcg-number-field-box slot="input" column name="" mode="none">
//     <whcg-number-field label="Hyreskostnad per kvm" @valueChanged=${this.initialRentCostPerSqmChanged.bind(this)} value=${this.initialRentCostPerSqm} suffix="kr" placeholder="...antal" kind="amount"></whcg-number-field>
//     <whcg-select label="Hyreshöjningstakt" suffix="%" @valueChanged=${this.rentincreaseChanged.bind(this)} value=${this.rentincrease} placeholder="...antal procent"
//         jsoninput='[{"value": 0.01, "caption": "1"}, {"value": 0.02, "caption": "2"}, {"value": 0.03, "caption": "2"}, {"value": 0.04, "caption": "4"}, {"value": 0.05, "caption": "5"}, {"value": 0.06, "caption": "6"}, {"value": 0.07, "caption": "7"}, {"value": 0.08, "caption": "8"}, {"value": 0.09, "caption": "9"}, {"value": 0.10, "caption": "10"}]'></whcg-select>
// </whcg-number-field-box>
// </whcg-section-textlong-chart-input>

// <whcg-section-textlong-input-chart class="col1span12">
// <span slot="title">Värmekostnader</span>
// <span slot="text">Selectedpage sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
// </span>
// <whcg-number-field-box slot="input" column name="" mode="none">
//     <whcg-number-field label="Antal kWh/kvm/år" @valueChanged=${this.kwhChanged.bind(this)} value=${this.kwh} placeholder="...antal" kind="amount" suffix="kWh" valueoutput="{{kwh}}"></whcg-number-field>
//     <whcg-number-field label="Kostnad per kWh" @valueChanged=${this.krperkwhChanged.bind(this)} value=${this.krperkwh} placeholder="... antal" kind="price" suffix="kr" valueoutput="{{krperkwh}}"></whcg-number-field>
// </whcg-number-field-box>
// <!-- <whcg-chart slot="chart" type="bar" width="800px" height="450px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
//     chartjson="{{chartJsCompoundedHeatCostsJson}}">
// </whcg-chart>  -->
// </whcg-section-textlong-input-chart>