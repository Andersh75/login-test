import { LitElement, html } from '@polymer/lit-element';

export class XTwo extends LitElement {

    render() {
        console.log('new render');

        return html`
        <style>
            .bg {
                background-color: purple;
                width: 80vw;
                height: 90vh;
                display: flex;
                /* align-items: center;
                justify-content: center; */
            }
           
        </style>
        <div class="bg">
        </div>
        `
    }  

}

customElements.define('x-two', XTwo);
