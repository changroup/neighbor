
import * as Service from '../../lib/service'

export const signOut = (Me, callback) => {
    return dispatch => {
        Service.signOut(Me, () => {            
            callback('success')
        })         
    }
}

export const joinChatRoom = (userId1, userId2, callback) => {
    return dispatch => {
        const roomID = Service.generateChatRoomID(userId1, userId2)
        callback(roomID)
    }
}