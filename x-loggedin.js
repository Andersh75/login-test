import { LitElement, html } from '@polymer/lit-element';
import '@vaadin/vaadin-checkbox';
import '@vaadin/vaadin-radio-button';

// import { storeCreator } from './store.js';
import './x-radiogroup';
import { Router } from '@vaadin/router';
import { connectmixin } from './connect-mixin.js';
import { usermixin } from './usermixin.js';
import { grid } from './grid.css.js';



const ONE_INCREMENT = 'ONE_INCREMENT';

const oneincrement = () => {
    return {
      type: ONE_INCREMENT
    };
  };


export class XLoggedin extends connectmixin(usermixin(LitElement)) {

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
        ${grid}
        <style>
            .bg {
                background-color: green;
                width: 100vw;
                height: 90vh;
                display: flex;
                flex-direction: column; 
                /* align-items: center;
                justify-content: center; */
            }
            .menu {
                background-color: lawngreen;
                /* height: 5vh; */
                /* display: flex;
                align-items: center;
                justify-content: center; */
            }
            .main {
                background-color: blue;
                height: 85vh;
                /* display: flex;
                align-items: center;
                justify-content: center; */
            }
            .headline-big {
                font-family: var(--parmaco-font-family);
                font-size: var(--parmaco-font-size-xxxxl);
                font-weight: var(--parmaco-font-weight-normal);
                color: var(--parmaco-base-color-100pct);
                padding-bottom: 60px;
                padding-top: 20px;
            }
        </style>

        <div class="grid-12">
            <div class="col2span2"></div>
            <div class="col4span9 headline-big">
                KALKYLMODELL FÖR SKOLLOKALER
            </div>

            <div class="col1span12">
                <x-radiogroup @selected-changed=${this.onSelectedChanged.bind(this)}>
                    <vaadin-radio-button name="1">1</vaadin-radio-button>
                    <vaadin-radio-button name="2">2</vaadin-radio-button>
                    <vaadin-radio-button name="3">3</vaadin-radio-button>
                    <vaadin-radio-button name="4">4</vaadin-radio-button>
                </x-radiogroup>
                <vaadin-checkbox @checked-changed=${this.onCheckboxChanged.bind(this)}>${this.counter}</vaadin-checkbox>
            </div>


            <div class="col1span12">
                <slot @slotchange=${this.onSlotchange.bind(this)}></slot>
            </div> 
        </div>
        
        `
    }

    onSlotchange({target}) {
        this.slotted = target.assignedNodes()
        this.slotted.forEach(slot => {
            slot.storeHolder = this;
            slot._stateChanged(this.store.getState()); 
        });
            
    }

    _stateChanged(state) {
        this.counter = state.one;
        this.slotted.forEach(slot => slot._stateChanged(state));
    }

    onCheckboxChanged(e) {
        try {
            this.store.dispatch(oneincrement());
        } catch(error) {

        }
        
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
}

customElements.define('x-loggedin', XLoggedin);   


    // onClick(e) {
    //     // store.dispatch(oneincrement());
    //     console.log(e);
    //     console.log('this');
    //     console.log(this);
        

    // }

    // _clickHandler(e) {
    //     console.log('CLICKED');
    //     console.log(e.detail);

    //     if(e.detail.value) {
    //         this.checked = e.path[0].id;
    //     }
        
    //     // console.log(this.shadowRoot.querySelector('#foo'));

    // }

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




            // connectedCallback() {
    //     super.connectedCallback();
    //     // let that = this;
    //     // this.username;
    //     // if (firebase.auth().currentUser.email == 'ahell@kth.se') {
    //     // this.username = 'ahell';
    //     // } else {
    //     //     this.username = 'ohej';
    //     // }
    //     // this.db = new PouchDB(this.username);
    //     // this.db.allDocs({
    //     // include_docs: true,
    //     // attachments: true
    //     // }).then(function (result) {
    //     //     console.log('RESULT');
    //     //     console.log(result)
    //     //     let initState = null;
    //     //     if (result.rows.length) {
    //     //         initState = result.rows[0].doc.state
    //     //     } else {
    //     //         initState = {
    //     //         one: 74,
    //     //         two: 47
    //     //         }
    //     //     }

    //     //     console.log('INIT STATE TO STORE CREATOR');
    //     //     console.log(initState);

    //     //     that.store = storeCreator(that.username, initState, that.db);
    //     //     that.__storeUnsubscribe = that.store.subscribe(() => that._stateChanged(that.store.getState()));
    //     //     console.log(that.store);
    //     // // // that.store.subscribe(() => that._stateChanged(that.store.getState()));
    //     // // // that._stateChanged(that.store.getState());
        

        
    //     // }).catch(function (err) {
    //     // console.log(err);
    //     // });

    //     // firebase.auth().onAuthStateChanged(function(user) {
    //     //     if (user) {      
    //     //         console.log('User Logged In');
    //     //     } else {
    //     //         that.__storeUnsubscribe();
    //     //         console.log('UNSUBSCRIBED');
    //     //     }
    //     // });
    // }