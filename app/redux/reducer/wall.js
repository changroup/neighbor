import createReducer from './createReducer'
import * as types from '../action/types'

export const previewImage = createReducer('',{
    [types.SET_PREVIEW_IMAGE](state, action){
        return action.payload;
    }
})

export const comment_count = createReducer(0 ,{
    [types.SET_COMMENT_NUMBER](state, action){
        return action.payload;
    }
})
