import { combineReducers } from 'redux';
import * as loginReducer from './login'
import * as wallReducer from './wall'
import * as chatReducer from './chat'

export default combineReducers(Object.assign(
    loginReducer,
    wallReducer,
    chatReducer
));