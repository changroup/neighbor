import RNFirebase from 'react-native-firebase';

const configurationOptions = {
    apiKey: "AIzaSyC2ZOzHgWmIcRykS8bk1uhHX2EB7P1meZY",
    authDomain: "nebzy-36952.firebaseapp.com",
    databaseURL: "https://nebzy-36952.firebaseio.com",
    projectId: "nebzy-36952",
    storageBucket: "",
    messagingSenderId: "806897739447"
};

const firebase = RNFirebase.initializeApp(configurationOptions);

export default firebase;