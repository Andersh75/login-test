import { LitElement, html } from '@polymer/lit-element';
import './x-login.js';
import './x-logout.js';
import './whcg-header.js';
import '@polymer/iron-icon';
import './whcg-button-box.js';

export class XRoot extends LitElement {
    
    render() {       
        return html`
        <style>
            .container {
                background-color: orange;
                width: 100vw;
            }

            .main {
                background-color: yellow;
                width: 100vw;
                height: 90vh;
            }

            .sidebar {
                background-color: blue;
                width: 20vw;
                height: 90vh;
            }
        </style>
        <div class="container">
            <whcg-header class="grid-12">
                <iron-icon slot="left" icon="parmaco-set:logo-crop" class="icon col2span4"></iron-icon>
                <whcg-button-box slot="right" class="col8span4"></whcg-button-box>
            </whcg-header>
            <slot></slot>
        </div>
        `
    }
}

customElements.define('x-root', XRoot);