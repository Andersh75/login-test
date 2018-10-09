import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@vaadin/vaadin-text-field/src/vaadin-text-field.js';
import './whcg-text-field-styles.js';

export class WhcgTextField extends PolymerElement {
    static get template() {
        return html `
        <style>
        vaadin-text-field {
                --whcg-host-before-font-size: var(--whcg-text-field-host-before-font-size);
                --whcg-host-before-height: var(--whcg-text-field-host-before-height);

                --whcg-host-padding-top: var(--whcg-text-field-host-padding-top);
                --whcg-host-padding-bottom: var(--whcg-text-field-host-padding-bottom);
                --whcg-host-padding-left: var(--whcg-text-field-host-padding-left);
                --whcg-host-padding-right: var(--whcg-text-field-host-padding-right);
                --whcg-host-haslabel-padding-top: var(--whcg-text-field-host-haslabel-padding-top);
                --whcg-host-haslabel-padding-bottom: var(--whcg-text-field-host-haslabel-padding-bottom);
                --whcg-host-haslabel-padding-left: var(--whcg-text-field-host-haslabel-padding-left);
                --whcg-host-haslabel-padding-right: var(--whcg-text-field-host-haslabel-padding-right);

                --whcg-label-font-size: var(--whcg-text-field-label-font-size);
                --whcg-label-font-weight: var(--whcg-text-field-label-font-weight);
                --whcg-label-font-family: var(--whcg-text-field-label-font-family);

                --whcg-label-color: var(--whcg-text-field-label-color);
                --whcg-label-host-focused-color: var(--whcg-text-field-label-host-focused-color);
                --whcg-label-host-hover-not-focused-color: var(--whcg-text-field-label-host-hover-not-focused-color);
                --whcg-label-host__dark-color: var(--whcg-text-field-label-host__dark-color);

                --whcg-label-padding-top: var(--whcg-text-field-label-padding-top);
                --whcg-label-padding-bottom: var(--whcg-text-field-label-padding-bottom);
                --whcg-label-padding-left: var(--whcg-text-field-label-padding-left);
                --whcg-label-padding-right: var(--whcg-text-field-label-padding-right);

                --whcg-input-field-font-family: var(--whcg-text-field-input-field-font-family);
                --whcg-input-field-font-size: var(--whcg-text-field-input-field-font-size);
                --whcg-input-field-font-weight: var(--whcg-text-field-input-field-font-weight);
                --whcg-input-field-background-color: var(--whcg-text-field-input-field-background-color);
                --whcg-input-field-host__dark-background-color: var(--whcg-text-field-input-field-host__dark-background-color);

                --whcg-input-field-host__shadow-box-shadow: var(--whcg-text-field-input-field-host__shadow-box-shadow);
                
                --whcg-input-field-border-radius: var(--whcg-text-field-input-field-border-radius);
                --whcg-input-field-border-style: var(--whcg-text-field-input-field-border-style);
                --whcg-input-field-border-width: var(--whcg-text-field-input-field-border-width);
                --whcg-input-field-border-color: var(--whcg-text-field-input-field-border-color);
                --whcg-input-field-padding-top: var(--whcg-text-field-input-field-padding-top);
                --whcg-input-field-padding-bottom: var(--whcg-text-field-input-field-padding-bottom);
                --whcg-input-field-padding-left: var(--whcg-text-field-input-field-padding-left);
                --whcg-input-field-padding-right: var(--whcg-text-field-input-field-padding-right);
              
                --whcg-value-color: var(--whcg-text-field-value-color);
                --whcg-value-placeholder-color: var(--whcg-text-field-value-placeholder-color);
                --whcg-value-host__dark-color: var(--whcg-text-field-value-host__dark-color);
                --whcg-value-min-height: var(--whcg-text-field-value-min-height);  

             }
            
        </style>
      
    <vaadin-text-field value="{{value}}" label="{{label}}" placeholder="{{placeholder}}">
    </vaadin-text-field>
    `;
    }

    static get properties() {

        return {

            label: {
                type: String,
                notify: true,
                readOnly: false,
            },
            value: {
                type: String,
                notify: true,
                readOnly: false,
                observer: '_valueChanged'
            },
            placeholder: {
                type: String,
                notify: true,
                readOnly: false,
            },
            suffix: {
                type: String,
                notify: true,
                readOnly: false,
            },
            kind: {
                type: String,
                notify: true,
                readOnly: false,
            },
            period: {
                type: String,
                notify: true,
                readOnly: false,
            },
            valueoutput: {
                type: String,
                notify: true,
                readOnly: false,
            }
        }
    }

    _valueChanged() {
        // console.log('new value');
        // console.log(this.value);
        this.valueoutput = this.value;
    }

    connectedCallback() {
        super.connectedCallback();
        let event = new CustomEvent('childrenattached', {bubbles: true, composed: true});
        // console.log('dispatchingEvent!!');
        this.dispatchEvent(event);
    }
}

window.customElements.define('whcg-text-field', WhcgTextField);