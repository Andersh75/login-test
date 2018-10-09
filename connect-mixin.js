import { storeCreator } from './store.js';
import { initState } from './state.js';

export const connectmixin = (element) => {
  return class ConnectMixin extends element {

    // This is called every time something is updated in the store.
    _stateChanged(state) {
      throw new Error('_stateChanged() not implemented', this);
    }

    disconnectedCallback() {
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
      this.__storeUnsubscribe();
    }

    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }

      let that = this;
      let username = this.user.currentUser.email.replace("@", "at");
      username = username.replace(".", "dot")
      let db = new PouchDB(username);
      let couchDB = new PouchDB(`http://plex:1111111111@127.0.0.1:5984/${username}`);
      
      db
      .replicate
      .from(couchDB)
      .on('complete', (info) => {   
        db.sync(couchDB, { live: true, retry: true })
          console.log('info');
          console.log(info); 
      })
      .on('error', (info) => {
          console.log('error');
          console.log(info);
      })
      .on('change', (info) => {
          console.log('change');
          console.log(info);
      });

      db.allDocs({
      include_docs: true,
      attachments: true
      }).then(function (result) {
          let state;
          if (result.rows.length) {
              state = result.rows[0].doc.state
          } else {
              state = initState;
          }
          that.store = storeCreator(username, state, db);
          that.__storeUnsubscribe = that.store.subscribe(() => that._stateChanged(that.store.getState()));
          that._stateChanged(that.store.getState());
          }).catch(function (err) {
            console.log(err);
          });

          that.user.onAuthStateChanged(function(user) {
          if (user) {      
              console.log('User Logged In');
          } else {
              that.__storeUnsubscribe();
              console.log('UNSUBSCRIBED');
          }
      });
    }
  };

}
