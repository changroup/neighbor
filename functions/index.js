const functions = require("firebase-functions");
const admin = require("firebase-admin");
const googleCloudStorage = require('@google-cloud/storage')({keyFilename: './firebase_admin_sdk.json' })
// initializes your application
admin.initializeApp(functions.config().firebase);
const databaseRef = admin.database()
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.addAudioWall = functions.database.ref('/Wall/{wallID}').onCreate(function(event){
    const wall = event.val();
    if(wall.audioURL === 'none') return false
    const bucket = googleCloudStorage.bucket('nebzy-36952.appspot.com')
    const file = bucket.file(wall.audioURL)
    return file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491'
    }).then(signedUrls => {
        // signedUrls[0] contains the file's public URL
        console.log('Audio Public URL: ', signedUrls[0])
    });
})

exports.sendNotifications = functions.database.ref('/Chat/{roomId}/{timeStamp}').onCreate(function(event){
    const notification = event.val()
    console.log('Notification Info: ', notification)
    return databaseRef.ref('User/' + notification.receiver).once('value', (snap) => {
        //fetched receivers profile
        const Receiver = snap.val()
        console.log('Receiver Info: ', Receiver)
        databaseRef.ref('User/' + notification.uid).once('value', (snap) => {
            //fetched senders profile
            const Sender = snap.val()
            console.log('Sender Info: ', Sender)    
            
            databaseRef.ref('Badge/' + Receiver.uid).once('value', (snap) => {
                //fetched Receivers badge datas
                const data = snap.val()
                let badge = 0
                if(data == null){

                }
                else if(data[Sender.uid] !== undefined){
                    badge = Number(data[Sender.uid].badge)
                }
                badge++
                // increased 1 to the badge from the sender
                let update = {}
                update[Sender.uid] = {
                    badge,
                    updated_at: new Date().getTime(),
                    from: Sender.uid
                }
                databaseRef.ref('Badge/' + Receiver.uid).update(update)
                //fetching total badge to show in the app icon
                let badgeNumber = 0
                if(data == null){
                    badgeNumber = 1
                }
                else 
                Object.keys(data).map(function(key) {
                    if(key == Sender.uid) badgeNumber++
                    else if(data[key] > 0) badgeNumber++
                })

                //send notification
                if(notification.text == 'none'){
                    var payload = {
                        notification: {
                            title: '🕤 ' + Sender.displayName + ' 💬' ,
                            body: 'Image attached',
                            sound: 'default',
                            badge: String(badgeNumber)
                        }
                    }
                    admin.messaging().sendToDevice(Receiver.token, payload)
                    .then(function(response) {
                        console.log('Successfully sent image:', response)
                    })
                    .catch(function(error){
                        console.log("Error sending image:", error)
                    })
                }
                else if(notification.image == 'none'){
                    var payload = {
                        notification: {
                            title: '🕤 ' + Sender.displayName + ' 💬' ,
                            body: notification.text,
                            //sound: 'default',
                            badge: String(badgeNumber)
                        }
                    }
                    admin.messaging().sendToDevice(Receiver.token, payload)
                    .then(function(response) {
                        console.log('Successfully sent text:', response)
                    })
                    .catch(function(error){
                        console.log("Error sending text:", error)
                    })
                }
            })   
        })
    })
    
})

exports.sendLikeNotification = functions.database.ref('/Like/{userID}/{likerID}').onWrite(function(event){
    const data = event.after.val()
    return databaseRef.ref('User/' + data.receiver).once('value', (snap) => {
        const Receiver = snap.val()
        databaseRef.ref('User/' + data.who).once('value', (snap) => {
            //fetched senders profile
            const Sender = snap.val()
            console.log('Sender Info: ', Sender)
            
            var payload = {
                notification: {
                    title: '',//'Hi ' + Receiver.displayName,
                    body: Sender.displayName.split(' ')[0] + ' 👍🏻💚💚💚📍',
                    //sound: 'default',
                }
            }

            admin.messaging().sendToDevice(Receiver.token, payload)
            .then(function(response) {
                console.log('Successfully sent image:', response)
            })
            .catch(function(error){
                console.log("Error sending image:", error)
            })
        })        
    })    
})

exports.updateComments = functions.database.ref('/Comment/{wallID}/{commentID}').onCreate(function(event){
    const comment = event.val()
    console.log(comment)
    return databaseRef.ref('Comment/' + comment.wall_id).once('value', (snap) => {
        //fetched senders profile
        let comments = {}
        if(snap.val()){
            comments = snap.val()
        }
        const count = Object.keys(comments).length
        const update = {
            comments: count
        }
        databaseRef.ref('Wall/' + comment.wall_id).update(update)
    })     
})

exports.removeWithWall = functions.database.ref('/Wall/{wallID}').onDelete(function(event){
    const data = event.val()
    let filePath, bucket, file
    if(data.imageURL.length > 10){
        filePath = `image/${data.imageURL}`
        bucket = googleCloudStorage.bucket('nebzy-36952.appspot.com')
        file = bucket.file(filePath)
    } else if(data.audioURL.length > 10){
        filePath = `audio/${data.audioURL}`
        bucket = googleCloudStorage.bucket('nebzy-36952.appspot.com')
        file = bucket.file(filePath)
    }
    file.delete().then(() => {
        console.log(`Successfully deleted ${filePath}`)
    }).catch(err => {
        console.log(`Failed to remove photo, error: ${err}`)
    });
    return databaseRef.ref('Comment/' + data.uid + data.timestamp).remove()
})

exports.removeFileWithChat = functions.database.ref('/Chat/{roomID}/{chatID}').onDelete(function(event){
    const data = event.val()
    console.log(data)
    const filePath = `image/${data.image}`
    const bucket = googleCloudStorage.bucket('nebzy-36952.appspot.com')
    const file = bucket.file(filePath)
    file.delete().then(() => {
        console.log(`Successfully deleted ${filePath}`)
    }).catch(err => {
        console.log(`Failed to remove photo, error: ${err}`)
    });
    return true
})
