import { html, LitElement } from '@polymer/lit-element';
import '@whcg/whcg-button';
import './x-login.js';
import './x-logout.js';

export class WhcgButtonBox extends LitElement {
    static get properties() {
        return {
          userobj: {type: Object}
        };
      }
    
      firstUpdated() {
        let that = this;
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                console.log('IN FROM RENDER');
                console.log(this);
                that.userobj = {...user};
                
            } else {
                console.log('OUT FROM RENDER');
                console.log(this);
                that.userobj = {...user};
            }
        });
      }

    render() {
        return html `
        <style>
            whcg-button {
                padding-left: 10px;
            }

        </style>
            ${firebase.auth().currentUser
                ? html`<x-logout></x-logout>`
                : html`<x-login></x-login>`
            }
            
    `;
    }

}

window.customElements.define('whcg-button-box', WhcgButtonBox);