import { LitElement, html } from '@polymer/lit-element';
import { grid } from './grid.css.js';

export class XLoggedout extends LitElement {
    render() {
        return html`
        ${grid}
        <style>
            .headline-big {
                font-family: var(--parmaco-font-family);
                font-size: var(--parmaco-font-size-xxxxl);
                font-weight: var(--parmaco-font-weight-normal);
                color: var(--parmaco-base-color-100pct);
                padding-bottom: 60px;
                padding-top: 20px;
            }
        </style>
        <div class="grid-12">
            <div class="col4span8 headline-big">
                LOGGA IN!
            </div>
        </div>
        `
    }
}

customElements.define('x-loggedout', XLoggedout);