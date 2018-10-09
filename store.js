import { persistentStore } from 'redux-pouchdb';
import { persistentReducer } from 'redux-pouchdb';
// import { persistentReducer } from 'redux-pouchdb-plus';
// import { persistentStore } from 'redux-pouchdb-plus';



// let dbChoice = 1;
// const db = (reducerName, store, additionalOptions) => {
//   if (dbChoice === 1)
//     return new PouchDB('dbname1');
//   else
//     return new PouchDB('dbname2');
// }

export function storeCreator(theuser) {
    console.log('theuser!');
    console.log(theuser);
    
    const db = new PouchDB(theuser.currentUser.email);     
    
    var logger = reduxLogger.logger;
    
    const applyMiddlewares = Redux.applyMiddleware(
        logger
      );
    
    const createStoreWithMiddleware = Redux.compose(
        applyMiddlewares,
        persistentStore(db)
    )(Redux.createStore);
    
    let initialState = {
        one: 74,
        two: 47
    }
    
    
    function counter(state, action) {
        switch (action.type) {
        case 'ONE_INCREMENT':
            return {...state, one: state.one + 1}
        case 'TWO_INCREMENT':
            return {...state, two: state.two + 1}
        default:
            return state
        }
    }
    
    const store = createStoreWithMiddleware(persistentReducer(counter), initialState);

    return store;
}


    // var couchDB = new PouchDB(`http://plex:1111111111@127.0.0.1:5984/redux`);
    
    
    // db
    // .replicate
    // .from(couchDB)
    // .on('complete', (info) => {   
    //     db.sync(couchDB, { live: true, retry: true })
    //     console.log('info');
    //     console.log(info); 
    // })
    // .on('error', (info) => {
    //     console.log('error');
    //     console.log(info);
    // })
    // .on('change', (info) => {
    //     console.log('change');
    //     console.log(info);
    // });