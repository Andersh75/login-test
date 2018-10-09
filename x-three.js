import { LitElement, html } from '@polymer/lit-element';

export class XThree extends LitElement {

    render() {
        console.log('new render');

        return html`
        <style>
            .bg {
                background-color: brown;
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

customElements.define('x-three', XThree);
