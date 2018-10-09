import { LitElement, html } from '@polymer/lit-element';

export class XLoggedout extends LitElement {
    render() {
        return html`
        <style>
            .bg {
                background-color: red;
                width: 100vw;
                height: 90vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        </style>
        <div class="bg">
        </div>
        `
    }
}

customElements.define('x-loggedout', XLoggedout);