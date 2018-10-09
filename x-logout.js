import { LitElement, html } from '@polymer/lit-element';
import '@whcg/whcg-button';
import { Router } from '@vaadin/router';

export class XLogout extends LitElement {
    render() {
        return html`
        <style>
            /* .bg {
                background-color: grey;
                width: 40vw;
                height: 8vh;
                display: flex;
                align-items: center;
                justify-content: center;
            } */
        </style>
        <whcg-button @click=${this.onClick.bind(this)}>LOGOUT</whcg-button>
        <!-- <div class="bg">
            
        </div> -->
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

customElements.define('x-logout', XLogout);