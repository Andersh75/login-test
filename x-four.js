import { LitElement, html } from '@polymer/lit-element';
import '@vaadin/vaadin-text-field';
import { action } from './actions.js';
import '@whcg/whcg-section-text-input';
import './whcg-select';
import './whcg-number-field-box.js';
import '@whcg/whcg-section-textlong-input-chart';
import '@whcg/whcg-section-chart-text-inputlong';
import '@whcg/whcg-section-textlong-chart-input'
import '@whcg/whcg-section-textlong-chartlong';
import './whcg-box-container.js';
// import './whcg-chart';
import './whcg-number-field';
import { grid } from './grid.css.js';


export class XFour extends LitElement {

    static get properties() {
        return {
            storeHolder: {type: Object},
        };
    }

    render() {
        return html`
        ${grid}
        <style>
        </style>
        <div class="grid-12">
            <whcg-section-textlong-chartlong class="col1span12">
                <span slot="title">SAMLADE KOSTNADER</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <!-- <whcg-lit-grid slot="chart"></whcg-lit-grid> -->
                <!-- <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
                    chartjson="{{chartJsMergedCompoundedCostsJson}}">
                </whcg-chart> -->
            </whcg-section-textlong-chartlong>

            <whcg-section-textlong-chartlong class="col1span12">
                <span slot="title">KOSTNADSTABELL</span>
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <!-- <whcg-lit-grid slot="chart"></whcg-lit-grid> -->
            </whcg-section-textlong-chartlong>
        </div>  `
    }


    initialAreaAmountChanged(e) {
        this.storeHolder.store.dispatch(action.initialAreaAmountValue(e.detail.value));
    }

    exp1yearChanged(e) {
        this.storeHolder.store.dispatch(action.exp1yearValue(e.detail.value));
    }

    exp2yearChanged(e) {
        this.storeHolder.store.dispatch(action.exp2yearValue(e.detail.value));
    }

    exp3yearChanged(e) {
        this.storeHolder.store.dispatch(action.exp3yearValue(e.detail.value));
    }

    exp4yearChanged(e) {
        this.storeHolder.store.dispatch(action.exp4yearValue(e.detail.value));
    }

    exp1areaChanged(e) {
        this.storeHolder.store.dispatch(action.exp1areaValue(e.detail.value));
    }

    exp2areaChanged(e) {
        this.storeHolder.store.dispatch(action.exp2areaValue(e.detail.value));
    }

    exp3areaChanged(e) {
        this.storeHolder.store.dispatch(action.exp3areaValue(e.detail.value));
    }

    exp4areaChanged(e) {
        this.storeHolder.store.dispatch(action.exp4areaValue(e.detail.value));
    }


    dec1yearChanged(e) {
        this.storeHolder.store.dispatch(action.dec1yearValue(e.detail.value));
    }

    dec2yearChanged(e) {
        this.storeHolder.store.dispatch(action.dec2yearValue(e.detail.value));
    }

    dec3yearChanged(e) {
        this.storeHolder.store.dispatch(action.dec3yearValue(e.detail.value));
    }

    dec4yearChanged(e) {
        this.storeHolder.store.dispatch(action.dec4yearValue(e.detail.value));
    }

    dec1areaChanged(e) {
        this.storeHolder.store.dispatch(action.dec1areaValue(e.detail.value));
    }

    dec2areaChanged(e) {
        this.storeHolder.store.dispatch(action.dec2areaValue(e.detail.value));
    }

    dec3areaChanged(e) {
        this.storeHolder.store.dispatch(action.dec3areaValue(e.detail.value));
    }

    dec4areaChanged(e) {
        this.storeHolder.store.dispatch(action.dec4areaValue(e.detail.value));
    }





    initialRentCostPerSqmChanged(e) {
        this.storeHolder.store.dispatch(action.initialRentCostPerSqmValue(e.detail.value));
    }

    rentincreaseChanged(e) {
        this.storeHolder.store.dispatch(action.rentincreaseValue(e.detail.value));
    }


    krperkwhChanged(e) {
        this.storeHolder.store.dispatch(action.krperkwhValue(e.detail.value));
    }

    kwhChanged(e) {
        this.storeHolder.store.dispatch(action.kwhValue(e.detail.value));
    }



    _stateChanged(state) {
        this.initialAreaAmount = state.initialAreaAmount;
        this.exp1year = state.exp1year;
        this.exp2year = state.exp2year;
        this.exp3year = state.exp3year;
        this.exp4year = state.exp4year;
        this.exp1area = state.exp1area;
        this.exp2area = state.exp2area;
        this.exp3area = state.exp3area;
        this.exp4area = state.exp4area;

        this.dec1year = state.dec1year;
        this.dec2year = state.dec2year;
        this.dec3year = state.dec3year;
        this.dec4year = state.dec4year;
        this.dec1area = state.dec1area;
        this.dec2area = state.dec2area;
        this.dec3area = state.dec3area;
        this.dec4area = state.dec4area;
        this.initialRentCostPerSqm = state.initialRentCostPerSqm;
        this.rentincrease = state.rentincrease;
        this.kwh = state.kwh;
        this.krperkwh = state.krperkwh;

    }
}

customElements.define('x-four', XFour);
