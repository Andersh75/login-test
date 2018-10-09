import { html, LitElement } from '@polymer/lit-element';
import '@whcg/whcg-general-styles/icons.js';
import { grid } from './grid.css.js';

export class WhcgHeader extends LitElement {
    render() {
        return html `
        ${grid}
        <style>
            :host {
                padding-top: var(--whcg-header-host-padding-top);
                padding-bottom: var(--whcg-header-host-padding-bottom);
                align-items: center;
            }

            ::slotted(.icon) {
                --iron-icon-width: 268px;
                --iron-icon-height: 85px;
                width: var(--iron-icon-width);
                height: var(--iron-icon-height);
            }

            ::slotted([slot=right]) {
                justify-self: end;
            } 
        </style>  
        <slot name='left'></slot>
        <slot name='right'></slot>
    `;
    }
}

window.customElements.define('whcg-header', WhcgHeader);