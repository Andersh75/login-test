import { LitElement, html } from '@polymer/lit-element';
import '@vaadin/vaadin-text-field/src/vaadin-text-field.js';

const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="whcg-number-field-styles" theme-for="vaadin-text-field">
  <template>
    <style>

    :host::before {
      font-size: var(--whcg-host-before-font-size);
      height: var(--whcg-host-before-height);
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
    }
    
    :host {        
      font-size: var(--whcg-host-font-size);
      padding-top: var(--whcg-host-padding-top);
      padding-bottom: var(--whcg-host-padding-bottom);
      padding-left: var(--whcg-host-padding-left);
      padding-right: var(--whcg-host-padding-right);
      box-sizing: border-box;
    }

    :host([has-label]) {
      padding-top: var(--whcg-host-haslabel-padding-top);
      padding-bottom: var(--whcg-host-haslabel-padding-bottom);
      padding-left: var(--whcg-host-haslabel-padding-left);
      padding-right: var(--whcg-host-haslabel-padding-right);
    }

    [part="label"] {
      font-weight: var(--whcg-label-font-weight);
      font-size: var(--whcg-label-font-size);
      font-family: var(--whcg-label-font-family);
      line-height: 1;
      color: var(--whcg-label-color);
      align-self: flex-start;
      padding-top: var(--whcg-label-padding-top);
      padding-bottom: var(--whcg-label-padding-bottom);
      padding-right: var(--whcg-label-padding-right);
      padding-left: var(--whcg-label-padding-left);

      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      position: relative;
      max-width: 100%;
      box-sizing: border-box;
    }

    :host(.dark) [part="label"] {
      color: var(--whcg-label-host__dark-color);
    }

    :host([focused]:not([readonly])) [part="label"] {
      color: var(--whcg-label-host-focused-not-readonly-color);
    }

    :host(:hover:not([focused])) [part="label"] {
      color: var(--whcg-label-host-hover-not-focused-color);
    }

    :host([focused]) [part="label"] {
      color: var(--whcg-label-host-focused-color);
    }

    [part="input-field"] {
      font-size: var(--whcg-input-field-font-size);
      font-weight: var(--whcg-input-field-font-weight);
      font-family: var(--whcg-input-field-font-family);
      line-height: 1;
      
      background-color: var(--whcg-input-field-background-color);
      border-radius: var(--whcg-input-field-border-radius);
      border-style: var(--whcg-input-field-border-style);
      border-width: var(--whcg-input-field-border-width);
      border-color: var(--whcg-input-field-border-color);
      padding-top: var(--whcg-input-field-padding-top);
      padding-bottom: var(--whcg-input-field-padding-bottom);
      padding-left: var(--whcg-input-field-padding-left);
      padding-right: var(--whcg-input-field-padding-right);

      position: relative;
      cursor: text;
      box-sizing: border-box;
    }

    :host(.dark) [part="input-field"] {
      background-color: var(--whcg-input-field-host__dark-background-color);
    }
    :host(.shadow) [part="input-field"] {
      box-shadow: var(--whcg-input-field-host__shadow-box-shadow);
    }


    [part="value"] {
      cursor: inherit;
      color: var(--whcg-value-color);
      min-height: var(--whcg-value-min-height);
      padding: 0 0.25em;
    }

    :host(.dark) [part="value"] {
      color: var(--whcg-value-host__dark-color);
    }


    [part="value"]::placeholder {
      color: var(--whcg-value-placeholder-color);;
    }



  </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

export class WhcgNumberField extends LitElement {
  render() {
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
      
    <vaadin-text-field id="vtf" @change=${this.valueChanged.bind(this)} value=${this.value} label=${this.label} placeholder=${this.placeholder} prevent-invalid-input pattern="[0-9]*" >
    </vaadin-text-field>
    `;
    }

    static get properties() {
      return {
          label: {type: String, reflect: true},
          value: {type: String, reflect: true},
          placeholder: {type: String, reflect: true},
          // suffix: {type: String, reflect: true},
          // kind: {type: String, reflect: true},
          // period: {type: String, reflect: true},
      };
    }


    valueChanged(e) {
      let newValue = this.shadowRoot.querySelector('#vtf').__data.value;
      this.dispatchEvent(new CustomEvent('valueChanged', { bubbles: true, composed: true, detail: { value: newValue } }))
    }

}

window.customElements.define('whcg-number-field', WhcgNumberField);



    // connectedCallback() {
    //     super.connectedCallback();
    //     let event = new CustomEvent('childrenattached', {bubbles: true, composed: true});
    //     this.dispatchEvent(event);
    // }
