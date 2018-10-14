import { PolymerElement } from '@polymer/polymer/polymer-element.js';


export class WhcgChartFeeder extends PolymerElement {
    
    static get properties() {
        return {
            whcgjsoninput: {
                type: String,
                readOnly: false,
                notify: true,
                observer: '_whcgjsoninputChanged'
            },
            chartjs: {
                type: String,
                notify: true,
                readOnly: false,
            },
            datapackage: {
                type: String,
                notify: true,
                readOnly: false,
            },
        }
    }


    
}

window.customElements.define('whcg-chart-feeder', WhcgChartFeeder);
