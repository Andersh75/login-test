import { LitElement, html } from '@polymer/lit-element';
import '@vaadin/vaadin-checkbox';
import '@vaadin/vaadin-radio-button';
// import { connect } from 'pwa-helpers/connect-mixin.js';
import { connectmixin } from './connect-mixin.js';
// import { storeCreator } from './store.js';
import './x-radiogroup';
import { Router } from '@vaadin/router';
import { usermixin} from './usermixin.js';


const ONE_INCREMENT = 'ONE_INCREMENT';

const oneincrement = () => {
    return {
      type: ONE_INCREMENT
    };
  };




export class XLoggedin extends connectmixin(usermixin(LitElement)) {
    connectedCallback() {
        super.connectedCallback(this.user);
        // this.store = storeCreator(this.user);
        this.store.subscribe(() => this._stateChanged(this.store.getState()));
    }

    static get properties() {
        return {
            counter: {type: String},
            checked: {type: String}
        };
    }

    constructor() {
        super();
        this.checked = 1;
    }

    render() {
        console.log('new render');



        return html`
        <style>
            .bg {
                background-color: green;
                width: 100vw;
                height: 90vh;
                display: flex;
                /* align-items: center;
                justify-content: center; */
            }
            .left {
                background-color: orange;
                width: 80vw;
                height: 90vh;
                /* display: flex;
                align-items: center;
                justify-content: center; */
            }
            .left {
                background-color: blue;
                width: 20vw;
                height: 90vh;
                /* display: flex;
                align-items: center;
                justify-content: center; */
            }
        </style>
        <div class="bg">
            <div class="left">
                <x-radiogroup @selected-changed=${this.onSelectedChanged.bind(this)}>
                    <vaadin-radio-button name="1">1</vaadin-radio-button>
                    <vaadin-radio-button name="2">2</vaadin-radio-button>
                    <vaadin-radio-button name="3">3</vaadin-radio-button>
                    <vaadin-radio-button name="4">4</vaadin-radio-button>
                </x-radiogroup>
            </div>
            <div class="right">
                <slot></slot>
            </div> 
        </div>
        `
    }

    _stateChanged(state) {
        console.log('stateChanged');
        console.log(state);
        this.counter = state.one;
    }

    onChange(e) {
        this.store.dispatch(oneincrement());
    }
    onSelectedChanged(e) {
        console.log('SELECTED CHANGED');
        console.log(e);
        if(e.detail.selected == 1) {
            Router.go('/user/one');
        }
        if(e.detail.selected == 2) {
            Router.go('/user/two');
        }
        if(e.detail.selected == 3) {
            Router.go('/user/three');
        }
        if(e.detail.selected == 4) {
            Router.go('/user/four');
        }
    }

    onClick(e) {
        // store.dispatch(oneincrement());
        console.log(e);
        console.log('this');
        console.log(this);
        

    }

    _clickHandler(e) {
        console.log('CLICKED');
        console.log(e.detail);

        if(e.detail.value) {
            this.checked = e.path[0].id;
        }
        
        // console.log(this.shadowRoot.querySelector('#foo'));

    }
}

customElements.define('x-loggedin', XLoggedin);   

// function XLoggedinCreator(theuser) {
    
// }


        // const items = [1, 2, 3];
        // const buttons = html`${items.map((i) => {
        //     if (i == this.checked) {
        //         console.log(`${i}: checked!`);
        //         return html`<vaadin-radio-button id="${i}" checked @checked-changed=${this._clickHandler.bind(this)}>${i}</vaadin-radio-button>`
        //     } else {
        //         return html`<vaadin-radio-button id="${i}" @checked-changed=${this._clickHandler.bind(this)}>${i}</vaadin-radio-button>`
        //     }
            
        // })}`;



        // const buttonsX = html`
        //     <vaadin-checkbox id="foo" name="foo" ?checked=${this.foochecked} @checked-changed=${this._clickHandler.bind(this)}>Foo</vaadin-checkbox>
        //     <vaadin-radio-button id="bar" name="bar" ?checked=${this.barchecked} @checked-changed=${this.onClick.bind(this)}>Bar</vaadin-radio-button>
        //     <vaadin-radio-button id="baz" name="baz" ?checked=${this.bazchecked} @checked-changed=${this.onClick.bind(this)}>Baz</vaadin-radio-button> 
        // `