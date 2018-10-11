import { LitElement, html } from '@polymer/lit-element';
import '@vaadin/vaadin-text-field';
import { action } from './actions.js';
import '@whcg/whcg-section-text-input';
import './whcg-select';
import './whcg-number-field-box.js';
import '@whcg/whcg-section-textlong-input-chart';
import '@whcg/whcg-section-chart-text-inputlong';
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
            krPerkwhOwn: {type: String}

            // inflationrate: {type: String},
            // startyear: {type: String},
            // numberofyears: {type: String}
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
                        <whcg-number-field label="År" value="3" placeholder="...antal" valueoutput="{{maint1yearOwn}}"></whcg-number-field>
                        <whcg-number-field label="Kostnad" value="700" suffix="kr" placeholder="...antal" valueoutput="{{maint1costOwn}}"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Underhållsinsats 2">
                        <whcg-number-field label="År" value="5" placeholder="...antal" valueoutput="{{maint2yearOwn}}"></whcg-number-field>
                        <whcg-number-field label="Kostnad" value="340" suffix="kr" placeholder="...antal" valueoutput="{{maint2costOwn}}"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Underhållsinsats 3">
                        <whcg-number-field label="År" value="2" placeholder="...antal" valueoutput="{{maint3yearOwn}}"></whcg-number-field>
                        <whcg-number-field label="Kostnad" value="249" suffix="kr" placeholder="...antal" valueoutput="{{maint3costOwn}}"></whcg-number-field>
                    </whcg-number-field-box>
                    <whcg-number-field-box column name="Underhållsinsats 4">
                        <whcg-number-field label="År" value="5" placeholder="...antal" valueoutput="{{maint4yearOwn}}"></whcg-number-field>
                        <whcg-number-field label="Kostnad" value="340" suffix="kr" placeholder="...antal" valueoutput="{{maint4costOwn}}"></whcg-number-field>
                    </whcg-number-field-box>
                </whcg-box-container>
            </whcg-section-chart-text-inputlong>



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
    }

    kwhOwnChanged(e) {
        this.storeHolder.store.dispatch(action.kwhOwnValue(e.detail.value));
    }

    krPerKwhOwnChanged(e) {
        this.storeHolder.store.dispatch(action.krPerKwhOwnValue(e.detail.value));
    }
}

customElements.define('x-two', XTwo);
