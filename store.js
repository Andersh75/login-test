import { persistentStore } from 'redux-pouchdb';
import { persistentReducer } from 'redux-pouchdb';
import { reducer } from './reducer.js';

export function storeCreator(username, state, db) {   
    
    const logger = reduxLogger.logger;
    
    const applyMiddlewares = Redux.applyMiddleware(
        logger
      );
    
    const createStoreWithMiddleware = Redux.compose(
        applyMiddlewares,
        persistentStore(db)
    )(Redux.createStore);

    const store = createStoreWithMiddleware(persistentReducer(reducer, username), state);

    return store;
}


