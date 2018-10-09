import { LitElement, html } from '@polymer/lit-element';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field/vaadin-text-field.js';
import '@vaadin/vaadin-text-field/vaadin-password-field.js';
import { Router } from '@vaadin/router';
import './whcg-text-field.js';
import '@whcg/whcg-button';
import { usermixin, theuser } from './usermixin.js';

export class XLogin extends usermixin(LitElement) {
    firstUpdated() {
        this.user.onAuthStateChanged(function(user) {
            if (user) {
                // console.log('User Logged In');
                // console.log(theuser.currentUser.email);
                Router.go('/user');
            } else {
                console.log('User Logged Out');
                Router.go('/');
            }
        });
    }

    render() {
        return html`
        <whcg-text-field id="name" placeholder="email..."></whcg-text-field>
        <whcg-text-field id="password" placeholder="password..."></whcg-text-field>
        <whcg-button @click=${this.onClick.bind(this)}>LOGIN</whcg-button>
        `
    }



    onClick(e) {
        let email = this.shadowRoot.querySelector('#name').value;
        let password = this.shadowRoot.querySelector('#password').value;
        this.user.signInWithEmailAndPassword(email, password).catch(function(error) {
            console.log('Login Error');
        });
    }
}

customElements.define('x-login', XLogin);