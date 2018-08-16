import * as types from './types'
import * as Service from '../../lib/service'

export const setPreviewImage = (imageURL) => {
    return {
        type: types.SET_PREVIEW_IMAGE,
        payload: imageURL
    }
}

export const setNumberOfComment = (number) => {
    return {
        type: types.SET_COMMENT_NUMBER,
        payload: number
    }
}

export const fetchWallDatas = (MyLocation, Me, callback) => {
    return dispatch => {
        Service.fetchWallDatas(MyLocation, Me, (data) => {
            callback(data)
        })
    }
}

export const setCommentCount = (wall) => {
    return dispatch => {
        Service.getNumberOfComment(wall, (number) => {
            dispatch(setNumberOfComment(number))
        })
    }
}

