import { LitElement, html } from '@polymer/lit-element';
import './x-login.js';
import './x-logout.js';
import './whcg-header.js';
import '@polymer/iron-icon';
import './whcg-button-box.js';
import { grid } from './grid.css.js';

export class XRoot extends LitElement {
    
    render() {       
        return html`
        ${grid}
        <style>

        .wrapper {
            display: grid;
            grid-template-columns: 1fr 1440px 1fr;
            background: linear-gradient(to bottom, #005F9A 100px,#005F9A 0vh,#63D1F4 300vh);
            background-attachment: fixed;
            min-height: 100vh;
        }

        .left {
            grid-column: 1;
        }

        .main {
            grid-column: 2;
        }

        .right {
            grid-column: 3;
        }

        .header {
            padding-top: 20px;
            padding-bottom: 0px;
        }

        </style>
        
        <div class="wrapper">
            <div class="left"></div>
            <div class="grid-12 main">
                <whcg-header class="grid-12 col1span12 header">
                    <iron-icon slot="left" icon="parmaco-set:logo-crop" class="icon col2span4"></iron-icon>
                    <whcg-button-box slot="right" class="col8span4"></whcg-button-box>
                </whcg-header>
                <div class="col1span12">
                    <slot></slot>
                </div>
                
            </div>
            <div class="right"></div>
        </div>
        `
    }
}

customElements.define('x-root', XRoot);