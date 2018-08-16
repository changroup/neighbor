import React from 'react'
import {Platform, Vibration, View, Text} from 'react-native'
import * as types from './types'
import * as Service from '../../lib/service'
import firebase from '../../lib/firebase'
import { showMessage } from 'react-native-messages';
var PushNotification = require('react-native-push-notification');
import { ifIphoneX } from 'react-native-iphone-x-helper'
import Color from '../../lib/color.js'


const CustomMessage = ({ message }) => {
    return (
        <View style={{
            ...ifIphoneX({
                height: 80,
                paddingTop: 20
            }, {
                height: 60,            
            }),
            paddingLeft: 20,
            justifyContent: 'center',
            backgroundColor: Color.blue
        }}>
            <Text style={{color: Color.white, paddingTop: 15, fontSize: 20, fontWeight: 'bold'}}>{message}</Text>
        </View>
    );
}

export const configureNotificationHandle = () => {
    return dispatch => {
        PushNotification.configure({
 
            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function(token) {
                console.log( 'TOKEN:', token );
            },
         
            // (required) Called when a remote or local notification is opened or received
            onNotification: function(notification) {
                console.log( 'NOTIFICATION:', JSON.stringify(notification));
                // const example = {
                //     foreground: true,
                //     userInteraction: false,
                //     message: {
                //         title: '',
                //         body: ''
                //     },
                //     data: {
                //         'gcm.message_id': '',
                //         remote: true,
                //         notificationId: ''
                //     },
                //     alert: {
                //         title: '',
                //         body: ''
                //     },
                //     sound: 'default'
                // }
                // process the notification
                //🏡✅💚💚💚
                //name🏡 👍🏻💚💚💚📍
                if(notification.foreground){
                    const body = Platform.OS === 'ios' ? notification.alert.body : notification.notification.body 
                    if(body !== undefined){
                        if(body.indexOf('👍🏻💚💚💚📍') > -1){
                            showMessage(
                                body, 
                                {
                                    messageComponent: CustomMessage,
                                    duration: 2000,
                                    slideAnimationOffset: 10,
                                    showAnimationDuration: 300,
                                    hideAnimationDuration: 300,
                                },
                            )
                            Vibration.vibrate(3000)
                        }
                    }
                }
                // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
                //notification.finish(PushNotificationIOS.FetchResult.NoData);
            },
         
            // IOS ONLY (optional): default: all - Permissions to register.
            permissions: {
                alert: true,
                badge: true,
                sound: true,
                foreground: true,
            },
            
         
            // Should the initial notification be popped automatically
            // default: true
            popInitialNotification: true,
         
            /**
              * (optional) default: true
              * - Specified if permissions (ios) and token (android and ios) will requested or not,
              * - if not, you must call PushNotificationsHandler.requestPermissions() later
              */
            requestPermissions: true,
        });
        // showMessage(
        //     'Someone liked you 💚', 
        //     {
        //         messageComponent: CustomMessage,
        //         duration: 3000,
        //         slideAnimationOffset: 10,
        //         showAnimationDuration: 600,
        //         hideAnimationDuration: 600,
        //     },
        // )
    }
}

export const setLocalNotification = () => {
    return {
        type: types.LOCAL_NOTIFICATION,
    }
}

export const loginDone = () => {
    return {
        type: types.WELCOME,
    }
}

export const setUserInfo = (data, photoURL, callback) => {
    return dispatch => {
        Service.saveUserData(data, photoURL, (res) => {
            dispatch(saveUserInfo(res))
            dispatch(setNearByUsers([]))
            callback('success')
        })        
    }
}

export const saveUserInfo = (data) => {
    return {
        type: types.SET_USER_DATA,
        data
    }
}

export const saveMyLocation = (position) => {
    return {
        type: types.SET_MY_LOCATION,
        position
    }
}

export const setNearByUsers = (users) => {
    return {
        type: types.SET_NEARBY_USERS,
        users
    }
}

export const setLikeUsers = (users) => {
    return {
        type: types.SET_LIKE_USERS,
        users
    }
}

export const setBadges = (badges) => {
    return {
        type: types.SET_BADGE,
        badges
    }
}

export const setBadgeNumber = (number) => {
    return {
        type: types.SET_BADGE_NUMBER,
        number
    }
}

export const startLocationListener = (user) => {
    return dispatch => {
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('MyLocation', '( ' + position.coords.latitude + ', ' + position.coords.longitude + ' )')
                dispatch(saveMyLocation(position))
                //update location to firebase
                Service.updateLocation(user, position, (result) => {
                    console.log('Update Location: ', result)
                    if(result == 'success'){
                        dispatch(startWatchPosition(user))
                    }
                })                
            }, 
            error => {
                console.log('Location Error', error);
            },
            { 
                enableHighAccuracy: true, 
                timeout: 20000, 
                maximumAge: 1000 
            }
        );
    }    
}

export const startWatchPosition = (user) => {
    return dispatch => {

        console.log('Starting WatchPosition')
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('Updated Location', '( ' + position.coords.latitude + ', ' + position.coords.longitude + ' )')
                dispatch(saveMyLocation(position))
                Service.updateLocation(user, position, (result) => {})
                //update nearby Users
                Service.getNearByUsers(position, user, (users) => {
                    dispatch(setNearByUsers(users))
                })               
            }, 
            error => {
                console.log('Location Error', error);
            },
            { 
                enableHighAccuracy: true, 
                timeout: 20000, 
                maximumAge: 1000 
            }
        );
        navigator.geolocation.watchPosition((position) => {
            console.log('Updated Location', '( ' + position.coords.latitude + ', ' + position.coords.longitude + ' )')
            dispatch(saveMyLocation(position))
            Service.updateLocation(user, position, (result) => {})
        });
    }
}

export const fetchBadges = (user) => {
    return dispatch => {
        Service.getBadges(user, (badges, number) => {
            dispatch(setBadges(badges))
            dispatch(setBadgeNumber(number))
            firebase.messaging().setBadgeNumber(number);
        })
    }
}

