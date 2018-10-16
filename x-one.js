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
    firstUpdated() {
        this.constructor.props().forEach(prop => this[`${prop.propKey}$`] = new rxjs.BehaviorSubject(this[prop.propKey]));
    }

    constructor() {
        super(); 
    }

    static get properties() {
        return this.props().reduce((acc, prop) => {
            return {...acc, [prop.propKey]: prop.propValue}
        })
    }

    static props() {
        return [
        { propKey: 'discountrate', propValue: {type: String} },
        { propKey: 'inflationrate', propValue: {type: String} },
        { propKey: 'numberofyears', propValue: {type: String} },
        { propKey: 'startyear', propValue: {type: String} }
        ]
    };

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

    valueChanged(e) {
        this.storeHolder.store.dispatch(action[`${e.path[0].id}Value`](e.detail.value));
    }

    _stateChanged(state) {
        this.constructor.props().forEach(prop => {
            if (this[prop.propKey] !== state[prop.propKey]) {
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
            <whcg-section-text-input class="col1span12">
                <span slot="title">KALKYLLÄNGD</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" column name="">
                    <whcg-select label="Kalkyllängd" id="numberofyears" suffix="år" @valueChanged=${this.valueChanged.bind(this)} value=${this.numberofyears} placeholder="...antal år" valueoutput="{{period}}" jsoninput='[{"value": 1, "caption": "1"}, {"value": 2, "caption": "2"}, {"value": 3, "caption": "2"}, {"value": 4, "caption": "4"}, {"value": 5, "caption": "5"}, {"value": 6, "caption": "6"}, {"value": 7, "caption": "7"}, {"value": 8, "caption": "8"}, {"value": 9, "caption": "9"}, {"value": 10, "caption": "10"}]'></whcg-select>
                    <whcg-select label="Startår" id="startyear" value=${this.startyear} placeholder="...år" @valueChanged=${this.valueChanged.bind(this)} jsoninput='[{"value": 2018, "caption": "2018"}, {"value": 2019, "caption": "2019"}, {"value": 2020, "caption": "2020"}, {"value": 2021, "caption": "2021"}, {"value": 2022, "caption": "2022"}, {"value": 2023, "caption": "2023"}, {"value": 2024, "caption": "2024"}, {"value": 2025, "caption": "2025"}, {"value": 2026, "caption": "2026"}, {"value": 2027, "caption": "2027"}]'></whcg-select>
                </whcg-number-field-box>
            </whcg-section-text-input>

            <whcg-section-text-input class="col1span12">
                <span slot="title">INFLATION</span>
                <whcg-number-field-box slot="input" name="Inflation">
                    <whcg-select label="Inflation" id="inflationrate" suffix="%" @valueChanged=${this.valueChanged.bind(this)} value=${this.inflationrate} placeholder="...antal procent" jsoninput='[{"value": 0.01, "caption": "1"}, {"value": 0.02, "caption": "2"}, {"value": 0.03, "caption": "2"}, {"value": 0.04, "caption": "4"}, {"value": 0.05, "caption": "5"}, {"value": 0.06, "caption": "6"}, {"value": 0.07, "caption": "7"}, {"value": 0.08, "caption": "8"}, {"value": 0.09, "caption": "9"}, {"value": 0.10, "caption": "10"}]'></whcg-select>
                </whcg-number-field-box>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
            </whcg-section-text-input>


            <whcg-section-text-input class="col1span12">
                <span slot="title">KALKYLRÄNTA</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" name="Kalkylränta">
                    <whcg-select label="Kalkylränta" id="discountrate" suffix="%" @valueChanged=${this.valueChanged.bind(this)} value=${this.discountrate} placeholder="...antal procent" jsoninput='[{"value": 0.01, "caption": "1"}, {"value": 0.02, "caption": "2"}, {"value": 0.03, "caption": "2"}, {"value": 0.04, "caption": "4"}, {"value": 0.05, "caption": "5"}, {"value": 0.06, "caption": "6"}, {"value": 0.07, "caption": "7"}, {"value": 0.08, "caption": "8"}, {"value": 0.09, "caption": "9"}, {"value": 0.10, "caption": "10"}]'></whcg-select>
                </whcg-number-field-box>
            </whcg-section-text-input>
        </div>  `
    }
}

customElements.define('x-one', XOne);


