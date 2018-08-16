import createReducer from './createReducer'
import * as types from '../action/types'

const default_location = {
    coords: {
        latitude: 0,
        longitude: 0
    }
}

export const appState = createReducer('Hello',{
    [types.WELCOME](state, action){
        return 'welcome';
    }
})

export const userInfo = createReducer({},{
    [types.SET_USER_DATA](state, action){
        return action.data;
    }
})

export const myLocation = createReducer(default_location,{
    [types.SET_MY_LOCATION](state, action){
        return action.position;
    }
})

export const nearByUsers = createReducer([],{
    [types.SET_NEARBY_USERS](state, action){
        return action.users;
    },
    [types.RESET_NEARBY_USERS](state, action){
        return [];
    }
})

export const likeUsers = createReducer([],{
    [types.SET_LIKE_USERS](state, action){
        return action.users;
    }
})

export const onLocalNotification = createReducer(false,{
    [types.LOCAL_NOTIFICATION](state, action){
        return true;
    }
})

export const myBadge = createReducer([],{
    [types.SET_BADGE](state, action){
        return action.badges;
    }
})

export const myBadgeNumber = createReducer(0,{
    [types.SET_BADGE_NUMBER](state, action){
        return action.number;
    }
})

