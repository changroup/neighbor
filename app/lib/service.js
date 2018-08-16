import ImageResizer from 'react-native-image-resizer';
import firebase from './firebase'
import * as _ from 'lodash'

const NEARBT_RADIUS = 33000 //(miles)
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
let MyID = ''
const NUMBER_FILTER = 200



export const configurePushNotification = (user) => {
    const FCM = firebase.messaging();
    FCM.requestPermissions();
    // gets the device's push token
    FCM.getToken().then(token => {    
        // stores the token in the user's document
        console.log('Device Notification Token: ', token)
        registerToken(user, token)
    });
    FCM.getInitialNotification()
    .then((notification) => {
        firebase.messaging().setBadgeNumber(0);
        console.log('Notification which opened the app: ', notification);
    });

    FCM.onMessage((message) => {
        // TODO
        console.log('Notification message: ', message);
    });
}

export const registerToken = (user, token) => {
    const ref = firebase.database().ref('/User/' + user.uid);
    ref.update({
        token
    })
}

export const saveUserData = (data, photoURL, callback) => {
    MyID = data.uid
    let ref = firebase.database().ref('/Like/' + MyID);
    ref.remove()
    ref = firebase.database().ref('/User/' + data.uid);
    const update = {
        active: true,
        displayName: data.displayName,
        email: data.email,
        emailVerified: data.emailVerified,
        photoURL: photoURL,
        providerId: data.providerData[0].providerId,
        socialUserId: data.providerData[0].uid,
        //refreshToken: data.refreshToken,
        uid: data.uid
    }
    ref.update(update);
    callback(update)
}

export const getUserData = (uid, callback) => {
    const ref = firebase.database().ref('/User/' + uid);
    ref.once('value', (snapshot) => {
        let user = {}
        if(snapshot.val()){
            user = snapshot.val()
        }
        callback(user)
    })
}

export const addSmallSizeImage = (roomID, key, filePath, TS, userInfo, userId, callback) => {
    const ref = firebase.database().ref('/Chat/' + roomID + '/' + key);
    ImageResizer.createResizedImage(filePath, 600, 600, 'JPEG', 60).then((response) => {
        // response.uri is the URI of the new image that can now be displayed, uploaded...
        // response.path is the path of the new image
        // response.name is the name of the new image with the extension
        // response.size is the size of the new image
        firebase.storage()
        .ref('/image/small-' + key)
        .putFile(response.uri, {
            contentType: 'image/jpeg',
        })
        .on('state_changed', snapshot => {
            // Current upload state
            console.log('uploading small size image...', snapshot);
        }, err => {
            console.log(err);
        }, uploadedFile => {
            console.log('uploadedFile', uploadedFile);
            ref.set({
                text: 'none',
                image: key,
                small: 'small-' + key,
                timestamp: TS,
                receiver: userId,
                uid: userInfo.uid,
            });
            callback('success')
        });
    }).catch((err) => {
        // Oops, something went wrong. Check that the filename is correct and
        // inspect err to get more details.
        console.log('Resize Error', err);
        alert('Resize Error', err.toString());
        callback('error')
    });
}

export const listenUserData = (uid, callback) => {
    const ref = firebase.database().ref('/User/' + uid);
    ref.on('value', (snapshot) => {
        let user = {}
        if(snapshot.val()){
            user = snapshot.val()
        }
        callback(user)
    })
}

export const updateLocation = (user, position, callback) => {
    const ref = firebase.database().ref('/User/' + user.uid);
    ref.update({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        updatedTime: position.timestamp
    })
    .then((result) => {
        callback('success')
    })
    .catch((e) => callback('error'))
}

export const getNearByUsers = (position, Me, callback) => {
    const ref = firebase.database().ref('/User');
    //alert(JSON.stringify(position))
    ref.on('value', (snapshot) => {
        let Users = snapshot.val()
        let result = []
        Object.keys(Users).map(function(key, index){
            const user = Users[key]
            const distance = getDistance(position.coords.latitude, position.coords.longitude, user.latitude, user.longitude, 'M')
            if(distance < NEARBT_RADIUS && user.active) {
                user.distance = distance
                result.push(user)
            }
        })
        callback(
            _.sortBy(result, function (value, key) {
                return value.distance;
            })
        )
    })
}

export const getDistance = (lat1, lon1, lat2, lon2, unit) => {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
}

export const signOut = (Me, callback) => {
    let ref = firebase.database().ref('/Like/' + Me.uid);
    ref.remove()
    .then(() => {
        ref = firebase.database().ref('/User/' + Me.uid);
        ref.update({active: false})
        firebase.auth().signOut()
        .then(() => {
            callback('success')
        })
        .catch(e=> alert(e.toString()));
    })
}

export const generateChatRoomID = (userId1, userId2) => {
    if(userId1 > userId2){
        return userId1 + userId2
    }
    else{
        return userId2 + userId1
    }
}

export const fetchMessages = (roomID, limit, callback) => {
    const ref = firebase.database().ref('/Chat/' + roomID);
    ref.on('value', (snapshot) => {
        let messages = []
        if(snapshot.val()){
            messages = snapshot.val()

            //convert json to json array
            let temp = []
            Object.keys(messages).map(function(key, index){
                temp.push(messages[key])
            })
            messages = _.orderBy(temp, ['timestamp'], ['asc'])
        }
        callback(messages)
    })
}

export const sendMessage = (msg, roomID, userId, Me) => {
    const timestamp = new Date().getTime()
    const key = Me.uid + timestamp
    const ref = firebase.database().ref('/Chat/' + roomID + '/' + key);
    ref.set({
        text: msg,
        image: 'none',
        timestamp,
        uid: Me.uid,
        receiver: userId,
    })
}

export const sendAudioFile = (userId, roomID, Me, audioFilePath, filename, callback) => {
    const timestamp = new Date().getTime()
    const key = Me.uid + timestamp
    firebase.storage()
    .ref('audio')
    .child(filename)
    .put(audioFilePath, { contentType : 'audio/mp3' })
    .then((snapshot) => {
        //save to wall database
        const ref = firebase.database().ref('/Chat/' + roomID + '/' + key);
        ref.set({
            text: '',
            image: 'none',
            audio: filename,
            timestamp,
            uid: Me.uid,
            receiver: userId,
        })
        callback('success')
    })
    .catch(e => {
        alert(e.toString())
    })    
}

export const fetchComments = (wallID, callback) => {
    const ref = firebase.database().ref('/Comment/' + wallID);
    ref.on('value', (snapshot) => {
        let comments = []
        if(snapshot.val()){
            comments = snapshot.val()

            //convert json to json array
            let temp = []
            Object.keys(comments).map(function(key, index){
                temp.push(comments[key])
            })
            //sort json array
            var sort_by = function(field, reverse, primer){
                var key = primer ? 
                    function(x) {return primer(x[field])} : 
                    function(x) {return x[field]};
                reverse = !reverse ? 1 : -1;
                return function (a, b) {
                    return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
                } 
            }
            temp.sort(sort_by('timestamp', false, String))
            comments = temp
        }
        callback(comments)
    })
}

export const sendComment = (Me, msg, wallID) => {
    const timestamp = new Date().getTime()
    const key = Me.uid + timestamp
    const ref = firebase.database().ref('/Comment/' + wallID + '/' + key);
    ref.set({
        text: msg,
        timestamp,
        uid: Me.uid,
        wall_id: wallID
    })
}

export const convertToDayTime = (TS) => {
    const date = new Date(TS)
    let h = date.getHours()
    const m = date.getMinutes()
    const AP = h > 11 ? 'PM' : 'AM'
    h = h % 13
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ' ' + AP
}

export const convertToYMDTime = (TS) => {
    const DT = new Date(TS)
    const Y = DT.getFullYear()
    const m = months[Number(DT.getMonth())]
    let d = DT.getDate()
    if(d == 1) d = d + 'st'
    else if(d == 2) d = d + 'nd'
    else if(d == 3) d = d + 'rd'
    else d = d + 'th'
    return m + ', ' + d + ' ' + Y
}

export const convertToFullTime = (TS) => {
    return convertToYMDTime(TS) + '  ' + convertToDayTime(TS)
}

export const fetchWallDatas = (MyLocation, Me, callback) => {
    const ref = firebase.database().ref('/Wall');
    ref.on('value', (snapshot) => {
        let walls = []
        if(snapshot.val()){
            walls = snapshot.val()
            //convert json to json array
            let temp = []
            Object.keys(walls).map(function(key, index){
                const wall = walls[key]
                if(wall.location == undefined) return
                if(wall.dislike !== undefined && wall.dislike.indexOf(Me.uid) > -1) return
                wall.key = index
                wall.distance = getDistance(MyLocation.coords.latitude, MyLocation.coords.longitude, wall.location.latitude, wall.location.longitude, 'M')
                temp.push(wall)              
            })
            const A = _.sortBy(temp, function (value, key) {
                return value.distance;
            })
            const B = A.slice(0, NUMBER_FILTER)
            //alert(JSON.stringify(B))
            walls = _.sortBy(B, function (value, key) {
                return -value.timestamp;
            })
        }
        callback(walls)
    })
}

export const postWall = (Me, msg, callback) => {
    const TS = new Date().getTime()
    const ref = firebase.database().ref('/Wall/' + Me.uid + TS);
    ref.set({
        text: msg,
        timestamp: TS,
        uid: Me.uid,
        audioURL: 'none',
        videoURL: 'none'
    })
    .then(() => {
        callback('success')
    })
    .catch(e => {
        callback(e.toString())
    })
}

export const postTextAndImage = (TS, imageURL, fileName, Me, msg, location, callback) => {
    const ref = firebase.database().ref('/Wall/' + fileName);
    if(imageURL == 'none'){        
        ref.set({
            text: msg,        
            audioURL: 'none',
            videoURL: 'none',
            image: 'none',
            small: 'none',
            timestamp: TS,
            uid: Me.uid,
            location
        })
        .then(() => {
            callback('success')
        })
        .catch(e => {
            alert(e.toString())
            callback('error')
        })
    }
    else{
        firebase.storage()
        .ref('image')
        .child(fileName)
        .put(imageURL, { contentType : 'image/jpeg' })
        .then((snapshot) => {
            //save to wall database
            ImageResizer.createResizedImage(imageURL, 600, 600, 'JPEG', 90).then((response) => {
                firebase.storage()
                .ref('/image/small-' + fileName)
                .putFile(response.uri, {
                    contentType: 'image/jpeg',
                })
                .on('state_changed', snapshot => {
                    // Current upload state
                    console.log('uploading small size image...', snapshot);
                }, err => {
                    console.log(err);
                }, uploadedFile => {
                    console.log('uploadedFile', uploadedFile);
                    ref.set({
                        text: msg,
                        audioURL: 'none',
                        videoURL: 'none',
                        image: fileName,
                        small: 'small-' + fileName,
                        timestamp: TS,
                        uid: Me.uid,
                        location
                    });
                    callback('success')
                })
            }).catch((err) => {
                // Oops, something went wrong. Check that the filename is correct and
                // inspect err to get more details.
                console.log('Resize Error', err);
                alert('Resize Error', err.toString());
            });
        })
        .catch(e => {
            alert(e.toString())
            callback('error')
        })
    }
    
}

export const uploadAudioFile = (TS, Me, filePath, fileName, location, callback) => {
    firebase.storage()
    .ref('audio')
    .child(fileName)
    .put(filePath, { contentType : 'audio/mp3' })
    .then((snapshot) => {
        //save to wall database
        const ref = firebase.database().ref('/Wall/' + Me.uid + TS);
        ref.set({
            photoURL: Me.photoURL,
            text: 'none',
            timestamp: TS,
            uid: Me.uid,
            audioURL: fileName,
            videoURL: 'none',
            imageURL: 'none',
            location
        })
        .then(() => {
            callback('success')
        })
        .catch(e => {
            callback(e.toString())
        })
        callback('success')
    })
    .catch(e => {
        alert(e.toString())
    })
}

export const uploadVideoFile = (TS, Me, filePath, fileName, msg, location, callback) => {
    firebase.storage()
    .ref('video')
    .child(fileName)
    .put(filePath, { contentType : 'video/mp4' })
    .then((snapshot) => {
        alert('Uploaded successfully!');
        //save to wall database
        const ref = firebase.database().ref('/Wall/' + Me.uid + TS);
        ref.set({
            photoURL: Me.photoURL,
            text: msg,
            timestamp: TS,
            uid: Me.uid,
            audioURL: 'none',
            videoURL: fileName,
            location
        })
        .then(() => {
            callback('success')
        })
        .catch(e => {
            callback(e.toString())
        })
        callback('success')
    })
    .catch(e => {
        alert(e.toString())
    })
}

export const downloadFirebaseAudio = (fileName, filePath, callback) => {
    firebase.storage()
    .ref('/audio/' + fileName)
    .downloadFile(filePath)
    .then(downloadedFile => {
        //success
        callback('success')
    })
    .catch(err => {
        //Error
        alert(err.toString())
    });
}

export const getFirebaseAudioURL = (fileName, callback) => {
    firebase.storage()
    .ref('/audio/' + fileName)
    .getDownloadURL()
    .then((url) => {
        callback(url)
    })
}



export const getFirebaseVideoURL = (fileName, filePath, callback) => {
    firebase.storage()
    .ref('/video/' + fileName)
    .downloadFile(filePath)
    .then(downloadedFile => {
        //success
        callback('success')
    })
    .catch(err => {
        //Error
        alert(err.toString())
    });
}

export const getNumberOfComment = (wall, callback) => {
    let ref = firebase.database().ref('/Comment/' + wall.uid + wall.timestamp);
    ref.once('value', (snapshot) => {
        let data = {}
        if(snapshot.val()){
            data = snapshot.val()
        }
        callback(Object.keys(data).length)
    })
}

export const convertDuringTime = (sec) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec) % 60
    return (m < 10 ? '0' : '') + m + ': ' + (s < 10 ? '0' : '') + s
}

export const generateKey = (uid) => {
    const TS = new Date().getTime()
    return uid + TS
}

export const getImageWithURL = (url, callback) => {
    firebase.storage()
    .ref('image/' + url)
    .getDownloadURL()
    .then((url) => {
        callback(url);
    })
}

export const likeUser = (userId, Me) => {
    const TS = new Date().getTime()
    const ref = firebase.database().ref('/Like/' + Me.uid + '/' + userId);
    let data = {
        invite: true,
        timestamp: TS,
        receiver: userId,
        who: Me.uid
    }
    ref.update(data)    
}

export const blockUser = (userId, Me) => {
    const ref = firebase.database().ref('/User/' + Me.uid);
    let blockUsers = []
    if(Me.blockUsers == undefined){
        blockUsers.push(userId)
    }
    else{
        blockUsers = JSON.parse(Me.blockUsers)
        blockUsers.push(userId)
    }
    ref.update({
        blockUsers: JSON.stringify(blockUsers)
    })
}

export const unblockUser = (userId, Me) => {
    const ref = firebase.database().ref('/User/' + Me.uid);
    let blockUsers = JSON.parse(Me.blockUsers)
    let index = blockUsers.indexOf(userId)
    if(index > -1){
        blockUsers.splice(index, 1);
    }    
    ref.update({
        blockUsers: JSON.stringify(blockUsers)
    })
}

export const getBadges = (Me, callback) => {
    const ref = firebase.database().ref('/Badge/' + Me.uid);
    
    ref.on('value', (snapshot) => {
        let data = {}
        let num = 0
        if(snapshot.val()){
            data = snapshot.val()
            let result = []            
            Object.keys(data).map(function(key){
                if(data[key].badge > 0) num++
                result.push(data[key])
            })
            result = _.sortBy(result, function(value, key) {
                return -value.updated_at
            })
            callback(result, num)
        }
        else{
            callback([], 0)
        }
    })
}

export const removeBadgeForUser = (userId, Me) => {
    const ref = firebase.database().ref('/Badge/' + Me.uid);
    let update = {}
    update[userId] = {
        badge: 0,
        updated_at: new Date().getTime(),
        from: userId
    }
    ref.update(update)
}

export const setBadgeNumber = (badge) => {
    firebase.messaging().setBadgeNumber(badge);
}

export const deleteWall = (post, Me) => {
    const postId = post.uid + post.timestamp
    const ref = firebase.database().ref('/Wall/' + postId);
    if(post.uid == Me.uid){        
        ref.remove()
    }
    else if(post.dislike == undefined){
        ref.update({
            ...post,
            dislike: JSON.stringify([Me.uid])
        })
    }
    else if(JSON.parse(post.dislike).length == 4){
        ref.remove()
    }
    else{
        let dislike = JSON.parse(post.dislike)
        dislike.push(Me.uid)
        ref.update({
            ...post,
            dislike: JSON.stringify(dislike)
        })
    }
}

export const getLikeUsers = (userId, callback) => {
    const ref = firebase.database().ref('/Like/');
    ref.on('value', (snapshot) => {
        let likeData = {}
        if(snapshot.val()){
            likeData = snapshot.val()
        }
        let likeUsers = []
        Object.keys(likeData).map(function(key) {
            if(JSON.stringify(likeData[key]).indexOf(userId) > -1){
                likeUsers.push(key)
            }
        })
        callback(likeUsers)
    })
}

export const removeUnreadUser = (userId, Me) => {
    let ref = firebase.database().ref('/Badge/' + Me.uid);
    ref.once('value', (snapshot) => {
        let data = {}
        if(snapshot.val()){
            data = snapshot.val()
            delete data[userId]
            ref = firebase.database().ref('/Badge/');
            const update = {}
            update[Me.uid] = data
            ref.update(update)
        }
    })
}

export const getTimeAgo = (previous) => {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;
    var current = new Date().getTime()

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}