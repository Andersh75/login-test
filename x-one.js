import { LitElement, html } from '@polymer/lit-element';
import '@vaadin/vaadin-text-field';
import { action } from './actions.js';

export class XOne extends LitElement {

    static get properties() {
        return {
            storeHolder: {type: Object},
            first: {type: Number},
            second: {type: Number},
        };
    }

    render() {
        return html`
        <style>
            .bg {
                background-color: lightcoral;
                width: 80vw;
                height: 90vh;
                /* display: flex; */
                /* align-items: center;
                justify-content: center; */
            }
           
        </style>
        <div class="bg">
            <vaadin-text-field id="first" label="FIRST" @change=${this.firstChanged.bind(this)} value=${this.first}></vaadin-text-field>
            <vaadin-text-field id="second" label="SECOND" @change=${this.secondChanged.bind(this)} value=${this.second}></vaadin-text-field>
            <vaadin-text-field id="sum" label="SUM" value=${this.adder([this.first,this.second])}></vaadin-text-field>
        </div>
        `
    }
    
    firstChanged(e) {
        this.storeHolder.store.dispatch(action.threevalue(Number(e.target.__data.value)));
    }

    secondChanged(e) {
        this.storeHolder.store.dispatch(action.fourvalue(Number(e.target.__data.value)));
    }

    adder(values) {
        return values.reduce((acc, value) => acc+value, 0);
    }

    _stateChanged(state) {
        this.first = state.three;
        this.second = state.four;
    }
}

customElements.define('x-one', XOne);
