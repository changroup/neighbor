import createReducer from './createReducer'
import * as types from '../action/types'

export const comments = createReducer({},{
    [types.SET_COMMENTS](state, action){
        return action.payload;
    }
})