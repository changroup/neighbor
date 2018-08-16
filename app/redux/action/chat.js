import * as types from './types'
import * as Service from '../../lib/service'

export const setComments = (data) => {
    return {
        type: types.SET_COMMENTS,
        payload: data
    }
}

export const fetchMessages = (roomID, limit, callback) => {
    return dispatch => {
        Service.fetchMessages(roomID, limit, (messages) => {
            callback(messages)
        })
    }
}

export const sendMessage = (msg, roomID, userId, Me) => {
    return dispatch => {
        Service.sendMessage(msg, roomID, userId, Me)
    }
}

export const fetchComments = (wallID, callback) => {
    return dispatch => {
        Service.fetchComments(wallID, (comments) => {
            dispatch(setComments(comments))
        })
    }
}