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
import '@whcg/whcg-chart';
import './whcg-number-field';
import { grid } from './grid.css.js';




export class XTwo extends LitElement {

    static get properties() {
        return {
            storeHolder: {type: Object},
            initialsqm: {type: String},
            initialEstablishCostPerSqmOwn: {type: String},
            kwhOwn: {type: String},
            krPerkwhOwn: {type: String},
            maint1yearOwn: {type: String},
            maint2yearOwn: {type: String},
            maint3yearOwn: {type: String},
            maint4yearOwn: {type: String},
            maint1costOwn: {type: String},
            maint2costOwn: {type: String},
            maint3costOwn: {type: String},
            maint4costOwn: {type: String},
            compoundrateRepairOwn: {type: String},
            initialRepairCostPerSqmOwn: {type: String}     
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
                <whcg-number-field-box slot="input" column name="">
                    <whcg-number-field label="Antal kvm" @valueChanged=${this.initialsqmChanged.bind(this)} value=${this.initialsqm} suffix="kvm" placeholder="...antal"></whcg-number-field>
                </whcg-number-field-box>
            </whcg-section-text-input>


            <whcg-section-textlong-input-chart class="col1span12">
                <span slot="text">Pellentesque sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <span slot="title">INITIAL ETABLERINGSKOSTNAD</span>
                <whcg-number-field-box slot="input" name="Inflation">
                    <whcg-number-field label="Etableringskostnad per kvm" @valueChanged=${this.initialEstablishCostPerSqmOwnChanged.bind(this)} value=${this.initialEstablishCostPerSqmOwn} suffix="kr" placeholder="...antal kr"></whcg-number-field>
                </whcg-number-field-box>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" chartjson="{{chartJsInitialEstablishCostOwn}}"></whcg-chart>
            </whcg-section-textlong-input-chart>


            <whcg-section-textlong-input-chart class="col1span12">
                <span slot="title">VÄRMEKOSTNADER</span>
                <span slot="text">Selectedpage sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-number-field-box slot="input" column name="">
                    <whcg-number-field label="Antal kWh/kvm/år" @valueChanged=${this.kwhOwnChanged.bind(this)} value=${this.kwhOwn} placeholder="...antal" kind="amount" suffix="kWh"></whcg-number-field>
                    <whcg-number-field label="Kostnad per kWh" @valueChanged=${this.krPerKwhOwnChanged.bind(this)} value=${this.krPerKwhOwn} placeholder="... antal" kind="price" suffix="kr"></whcg-number-field>
                </whcg-number-field-box>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
                    chartjson="{{chartJsCompoundedHeatCostsOwnJson}}">
                </whcg-chart> 
            </whcg-section-textlong-input-chart>


            <whcg-section-chart-text-inputlong class="col1span12">
                <span slot="title">PLANNERAT UNDERHÅLL</span>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica" chartjson="{{chartJsSumMaintenanceAllJson}}">
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
            </whcg-section-chart-text-inputlong>

            <whcg-section-textlong-chart-input class="col1span12">
                <span slot="title">KOSTNADER FÖR REPARATIONER OCH LÖPANDE UNDERHÅLL</span>
                <span slot="text">Selectedpage sit amet nisl odio. Duis erat libero, placerat vitae mi at, bibendum porta nisi. Proin fermentum mi et nibh sollicitudin, in interdum mauris molestie. Aliquam fermentum dolor pulvinar tempus blandit. Cras aliquam lectus ut dolor ornare aliquam. Curabitur lobortis ut nibh in sollicitudin. In viverra facilisis magna, a tempus lorem dictum at. Ut porta vehicula lacus, nec mollis libero rutrum id. Aliquam quis tristique risus.
                </span>
                <whcg-chart slot="chart" type="bar" width="800px" height="300px" legendposition="right" legendfontsize="10" legendfontfamily="Helvetica"
                    chartjson="{{chartJsCompoundedRepairCostsOwnJson}}">
                </whcg-chart> 
                <whcg-number-field-box slot="input" column name="" mode="none">
                    <whcg-select label="Kostnadsutveckling" suffix="%" @valueChanged=${this.compoundrateRepairOwnChanged.bind(this)} value=${this.compoundrateRepairOwn} placeholder="...antal procent" jsoninput='[{"value": 0.01, "caption": "1"}, {"value": 0.02, "caption": "2"}, {"value": 0.03, "caption": "2"}, {"value": 0.04, "caption": "4"}, {"value": 0.05, "caption": "5"}, {"value": 0.06, "caption": "6"}, {"value": 0.07, "caption": "7"}, {"value": 0.08, "caption": "8"}, {"value": 0.09, "caption": "9"}, {"value": 0.10, "caption": "10"}]'></whcg-select>
                    <whcg-number-field label="Kostnad per kvm" @valueChanged=${this.initialRepairCostPerSqmOwnChanged.bind(this)} value=${this.initialRepairCostPerSqmOwn} placeholder="... antal" kind="price" suffix="kr"></whcg-number-field>
                </whcg-number-field-box>
            </whcg-section-textlong-input-chart>

        </div>  `
    }


    adder(values) {
        return values.reduce((acc, value) => acc+value, 0);
    }

    valueChanged(e) {
        let newValue = this.$.vdm.__data.value;
        this.dispatchEvent(new CustomEvent('valueChanged', { bubbles: true, composed: true, detail: { value: newValue } }))
      }

    initialsqmChanged(e) {
        this.storeHolder.store.dispatch(action.initialsqmvalue(e.detail.value));
    }

    initialEstablishCostPerSqmOwnChanged(e) {
        this.storeHolder.store.dispatch(action.initialEstablishCostPerSqmOwnValue(e.detail.value));
    }

    _stateChanged(state) {
        this.initialsqm = state.initialsqm;
        this.initialEstablishCostPerSqmOwn = state.initialEstablishCostPerSqmOwn;
        this.kwhOwn = state.kwhOwn;
        this.krPerKwhOwn = state.krPerKwhOwn;
        this.maint1yearOwn = state.maint1yearOwn;
        this.maint2yearOwn = state.maint2yearOwn;
        this.maint3yearOwn = state.maint3yearOwn;
        this.maint4yearOwn = state.maint4yearOwn;
        this.maint1costOwn = state.maint1costOwn;
        this.maint2costOwn = state.maint2costOwn;
        this.maint3costOwn = state.maint3costOwn;
        this.maint4costOwn = state.maint4costOwn;
        this.initialRepairCostPerSqmOwn = state.initialRepairCostPerSqmOwn;
        this.compoundrateRepairOwn = state.compoundrateRepairOwn;
    }

    kwhOwnChanged(e) {
        this.storeHolder.store.dispatch(action.kwhOwnValue(e.detail.value));
    }

    krPerKwhOwnChanged(e) {
        this.storeHolder.store.dispatch(action.krPerKwhOwnValue(e.detail.value));
    }

    maint1costOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint1costOwnValue(e.detail.value));
    }

    maint2costOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint2costOwnValue(e.detail.value));
    }

    maint3costOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint3costOwnValue(e.detail.value));
    }

    maint4costOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint4costOwnValue(e.detail.value));
    }

    maint1yearOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint1yearOwnValue(e.detail.value));
    }

    maint2yearOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint2yearOwnValue(e.detail.value));
    }

    maint3yearOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint3yearOwnValue(e.detail.value));
    }

    maint4yearOwnChanged(e) {
        this.storeHolder.store.dispatch(action.maint4yearOwnValue(e.detail.value));
    }

    compoundrateRepairOwnChanged(e) {
        this.storeHolder.store.dispatch(action.compoundrateRepairOwnValue(e.detail.value));
    }

    initialRepairCostPerSqmOwnChanged(e) {
        this.storeHolder.store.dispatch(action.initialRepairCostPerSqmOwnValue(e.detail.value));
    } 
}

customElements.define('x-two', XTwo);
