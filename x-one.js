import { LitElement, html } from '@polymer/lit-element';
import '@vaadin/vaadin-text-field';
import { action } from './actions.js';
import '@whcg/whcg-section-text-input';
import './whcg-select';
import './whcg-number-field-box';
import { grid } from './grid.css.js';
import { whcgJsonMaker, whcgObjMerger, whcgPeriodOperator, getRandomColor, whcgChartJsTransformer, singleMultiplier, whcgCompounder, setFactory, setsPeriodOperator, setCompounder, whcgObjMaker } from './whcg-functions.js';
import * as rxjs from 'rxjs';

export class XOne extends LitElement {

    constructor() {
        super();
        this.discountrate$ = new rxjs.BehaviorSubject(0);
        this.inflationrate$ = new rxjs.BehaviorSubject(0);
        this.startyear$ = new rxjs.BehaviorSubject(0);
        this.numberofyears$ = new rxjs.BehaviorSubject(0);
    }

    static get properties() {
        return {
            storeHolder: {type: Object},
            discountrate: {type: String},
            inflationrate: {type: String},
            startyear: {type: String},
            numberofyears: {type: String}
        };
    }

    updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('discountrate')) {
            this.discountrate$.next(this.discountrate);
        }

        if (changedProps.has('inflationrate')) {
            this.inflationrate$.next(this.inflationrate);
        }

        if (changedProps.has('startyear')) {
            this.startyear$.next(this.startyear);
        }

        if (changedProps.has('numberofyears')) {
            this.numberofyears$.next(this.numberofyears);
        }
    }

    render() {
        return html`
        ${grid}
        <style>
        </style>
        <div class="grid-12">
            <whcg-section-text-input class="col1span12">
                <span slot="title">KALKYLLÄNGD</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" column name="">
                    <whcg-select label="Kalkyllängd" suffix="år" @valueChanged=${this.numberofyearsChanged.bind(this)} value=${this.numberofyears} placeholder="...antal år" valueoutput="{{period}}" jsoninput='[{"value": 1, "caption": "1"}, {"value": 2, "caption": "2"}, {"value": 3, "caption": "2"}, {"value": 4, "caption": "4"}, {"value": 5, "caption": "5"}, {"value": 6, "caption": "6"}, {"value": 7, "caption": "7"}, {"value": 8, "caption": "8"}, {"value": 9, "caption": "9"}, {"value": 10, "caption": "10"}]'></whcg-select>
                    <whcg-select label="Startår" value=${this.startyear} placeholder="...år" @valueChanged=${this.startyearChanged.bind(this)} jsoninput='[{"value": 2018, "caption": "2018"}, {"value": 2019, "caption": "2019"}, {"value": 2020, "caption": "2020"}, {"value": 2021, "caption": "2021"}, {"value": 2022, "caption": "2022"}, {"value": 2023, "caption": "2023"}, {"value": 2024, "caption": "2024"}, {"value": 2025, "caption": "2025"}, {"value": 2026, "caption": "2026"}, {"value": 2027, "caption": "2027"}]'></whcg-select>
                </whcg-number-field-box>
            </whcg-section-text-input>

            <whcg-section-text-input class="col1span12">
                <span slot="title">INFLATION</span>
                <whcg-number-field-box slot="input" name="Inflation">
                    <whcg-select label="Inflation" suffix="%" @valueChanged=${this.inflationrateChanged.bind(this)} value=${this.inflationrate} placeholder="...antal procent" jsoninput='[{"value": 0.01, "caption": "1"}, {"value": 0.02, "caption": "2"}, {"value": 0.03, "caption": "2"}, {"value": 0.04, "caption": "4"}, {"value": 0.05, "caption": "5"}, {"value": 0.06, "caption": "6"}, {"value": 0.07, "caption": "7"}, {"value": 0.08, "caption": "8"}, {"value": 0.09, "caption": "9"}, {"value": 0.10, "caption": "10"}]'></whcg-select>
                </whcg-number-field-box>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
            </whcg-section-text-input>


            <whcg-section-text-input class="col1span12">
                <span slot="title">KALKYLRÄNTA</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" name="Kalkylränta">
                    <whcg-select label="Kalkylränta" suffix="%" @valueChanged=${this.discountrateChanged.bind(this)} value=${this.discountrate} placeholder="...antal procent" jsoninput='[{"value": 0.01, "caption": "1"}, {"value": 0.02, "caption": "2"}, {"value": 0.03, "caption": "2"}, {"value": 0.04, "caption": "4"}, {"value": 0.05, "caption": "5"}, {"value": 0.06, "caption": "6"}, {"value": 0.07, "caption": "7"}, {"value": 0.08, "caption": "8"}, {"value": 0.09, "caption": "9"}, {"value": 0.10, "caption": "10"}]'></whcg-select>
                </whcg-number-field-box>
            </whcg-section-text-input>
        </div>  `
    }

    discountrateChanged(e) {
        this.storeHolder.store.dispatch(action.discountratevalue(e.detail.value));
    }

    inflationrateChanged(e) {
        this.storeHolder.store.dispatch(action.inflationratevalue(e.detail.value));
    }

    numberofyearsChanged(e) {
        this.storeHolder.store.dispatch(action.numberofyearsvalue(e.detail.value));
    }

    startyearChanged(e) {
        this.storeHolder.store.dispatch(action.startyearvalue(e.detail.value));
    }

    // adder(values) {
    //     return values.reduce((acc, value) => acc+value, 0);
    // }

    _stateChanged(state) {
        if (this.discountrate !== state.discountrate) {
            this.discountrate = state.discountrate;
        }

        if (this.inflationrate !== state.inflationrate) {
            this.inflationrate = state.inflationrate;
        }

        if (this.startyear !== state.startyear) {
            this.startyear = state.startyear;
        }

        if (this.numberofyears !== state.numberofyears) {
            this.numberofyears = state.numberofyears;
        }
    }
}

customElements.define('x-one', XOne);


