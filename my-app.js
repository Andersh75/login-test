import { LitElement, html } from '@polymer/lit-element';
import '@polymer/polymer';
import { Router } from '@vaadin/router';
import '@whcg/whcg-general-styles/color.js';
import '@whcg/whcg-general-styles/flex.js';
import '@whcg/whcg-general-styles/font-icons.js';
import '@whcg/whcg-general-styles/icons.js';
import '@whcg/whcg-general-styles/sizing.js';
import '@whcg/whcg-general-styles/spacing.js';
import '@whcg/whcg-general-styles/style.js';
import '@whcg/whcg-general-styles/stylesandshapes.js';
import '@whcg/whcg-general-styles/typography.js';
import './x-loggedout.js';
import './x-loggedin.js';
import './x-root.js';
import './x-one.js';
import './x-two.js';
import './x-three.js';
import './x-four.js';
import { usermixin } from './usermixin.js';


export class MyApp extends usermixin(LitElement) {
    firstUpdated() {
        const outlet = this.shadowRoot.querySelector('#outlet');
        const router = new Router(outlet);

          router.setRoutes([
            {path: '/', 
                component: 'x-root',
                children: [
                    {path: '/', action: this.rootAction.bind(this)},
                    {path: '/user', 
                        action: this.userAction.bind(this),
                        children: [
                            {path: '/', action: this.menuOneAction.bind(this)},
                            {path: '/one', action: this.menuOneAction.bind(this)},
                            {path: '/two', action: this.menuTwoAction.bind(this)},
                            {path: '/three', action: this.menuThreeAction.bind(this)},
                            {path: '/four', action: this.menuFourAction.bind(this)},
                        ]},  
                ]},
          ]);
    }

    render() {
        return html`
        <div id="outlet"></div>
        `
    }

    rootAction(context, commands) {
        if(this.user.currentUser) {
            return commands.redirect('/');
        } else {
            const loggedOutElement = commands.component('x-loggedout');
            return loggedOutElement;
        }   
    }
    
    userAction(context, commands) {
        if(this.user.currentUser) {
            const loggedinElement = commands.component('x-loggedin');
            return loggedinElement;
        } else {
            return commands.redirect('/');
        }   
    }

    menuOneAction(context, commands) {
        const loggedinElement = commands.component('x-one');
        return loggedinElement;
    }

    menuTwoAction(context, commands) {
        const loggedinElement = commands.component('x-two');
        return loggedinElement;
    }

    menuThreeAction(context, commands) {
        const loggedinElement = commands.component('x-three');
        return loggedinElement;
    }

    menuFourAction(context, commands) {
        const loggedinElement = commands.component('x-four');
        return loggedinElement;
    } 
}

customElements.define('my-app', MyApp);