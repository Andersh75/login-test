import { LitElement, html } from '@polymer/lit-element';
import '@vaadin/vaadin-button';
import { Router } from '@vaadin/router';

export class XUser extends LitElement {
    render() {
        return html`
        <style>
            .bg {
                background-color: orange;
                width: 80vw;
                height: 90vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        </style>
        <div class="bg">
            <vaadin-button @click=${this.onClick.bind(this)}>LOGOUT</vaadin-button>
            <vaadin-button @click=${this.onGreen.bind(this)}>GREEN</vaadin-button>
        </div>
        `
    }

    onClick(e) {
        firebase.auth().signOut().then(function() {
            console.log('Sign-out successful');
          }).catch(function(error) {
            console.log('Error Signing Out');
          });
    }

    onGreen(e) {
        Router.go('/user/green');
    }
}

customElements.define('x-user', XUser);