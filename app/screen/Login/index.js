'use strict';

/*jshint esversion: 6*//*jshint node: true*/
import React, {Component} from 'react'
import {View, StyleSheet, Platform, Image, NativeModules, AsyncStorage, Dimensions, Text, TouchableOpacity} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import Color from '../../lib/color.js'
import firebase from '../../lib/firebase'
import { WaveIndicator } from 'react-native-indicators';
import { GoogleSignin } from 'react-native-google-signin';
import Video from 'react-native-video';


const VideoiOS = require('../../resource/video/intro.mp4')
const VideoAndroid = {uri: 'intro'}

const FBSDK = require('react-native-fbsdk');
const {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager
} = FBSDK;
const Height = Dimensions.get('window').height
const { RNTwitterSignIn } = NativeModules
const Constants = {
    //Dev Parse keys
    TWITTER_COMSUMER_KEY: "wpVoApexXpoDRv4o2jRkzBhPc",
    TWITTER_CONSUMER_SECRET: "DHxUXeQAxVFckiBUSegH7p73yl4MRabDKrurYnA8jrlSP9d3wE"
}

export class Login extends Component{
    constructor(props){
        super(props);
        const autoLogin = (this.props.navigation.state.params == undefined) ? true : this.props.navigation.state.params.autoLogin
        //const autoLogin = false
        this.state = {
            isLoading: false,
            showVideo: true,
            autoLogin: autoLogin !== undefined ? autoLogin : true
        };
    };

    autoLogin() {
        if(!this.state.autoLogin) return
        setTimeout(() => {
            AsyncStorage.getItem('credential', (err, credential) => {
                AsyncStorage.getItem('myPhoto', (error, photo) => {
                    console.log(credential);
                    if(!err && credential != null){
                        this.setState({isLoading: true})
                        firebase.auth().signInWithCredential(JSON.parse(credential))
                        .then((currentUser) => {
                            if (currentUser) {
                                console.info(JSON.stringify(currentUser.toJSON()))                
                                this.props.setUserInfo(currentUser, photo, () => {
                                    this.setState({isLoading: false})
                                    this.onLoginSuccess()
                                })
                            }
                        })
                        .catch((error) => {
                            alert(`Login fail with error: ${error}`)
                            //alert('Error occured while auto-login')
                            this.setState({isLoading: false})
                        })
                    }
                })
            });
        }, 800)     
    }

    onLoginSuccess() {
        AsyncStorage.getItem('terms_accpeted', (err, result) => {
            if(!err && result != null){
                this.props.navigation.navigate('home')
            }
            else{
                this.props.navigation.navigate('terms')
            }
        })
    }

    onTwitterLogin() {
        //alert('comming soon')
        RNTwitterSignIn.init(Constants.TWITTER_COMSUMER_KEY, Constants.TWITTER_CONSUMER_SECRET)
        RNTwitterSignIn.logIn()
        .then(loginData => 
            {
                console.log(loginData)
                const { authToken, authTokenSecret } = loginData
                const credential = firebase.auth.TwitterAuthProvider.credential(authToken, authTokenSecret);
                return firebase.auth().signInWithCredential(credential)
                .then((currentUser) => {
                    //alert(JSON.stringify(currentUser))
                    if (currentUser) {
                        console.log('Twitter_User', currentUser)                
                        this.props.setUserInfo(currentUser, currentUser.photoURL, () => {
                            this.setState({isLoading: false})
                            this.onLoginSuccess()
                        })
                    }
                })
                .catch((error) => {
                    this.setState({isLoading: false})
                    console.log(`Login fail with error: ${error}`)
                })
            })
            .catch(error => {
                console.log(error)
            }
        )
    }

    async onGoogleLogin() {
        if (Platform.OS === 'ios') {
            GoogleSignin.configure({
                webClientId: '806897739447-tevi0r20ju9s0u7hddkptthf21cnf16a.apps.googleusercontent.com',
                scopes: ["https://www.googleapis.com/auth/drive.readonly"],
                iosClientId: '806897739447-urcu7v8ga9c7k4etgft08ukrlkqj67hu.apps.googleusercontent.com', // only for iOS
            })
            .then(() => {
                // you can now call currentUserAsync()
                GoogleSignin.signIn()
                .then((user) => {
                    console.log('Google User', user);
                    this.AuthWithGoogleUser(user)
                })
                .catch((err) => {
                    console.log('WRONG SIGNIN', err);
                })
                .done();
            });
        } else {
            GoogleSignin.configure({
                scopes: ["https://www.googleapis.com/auth/drive.readonly"], // what API you want to access on behalf of the user, default is email and profile
                webClientId: '806897739447-tevi0r20ju9s0u7hddkptthf21cnf16a.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
            })
            .then(() => {
                // you can now call currentUserAsync()
                GoogleSignin.signIn()
                .then((user) => {
                    console.log('Google User', user);
                    this.AuthWithGoogleUser(user)
                })
                .catch((err) => {
                    console.log('WRONG SIGNIN', err);
                })
                .done();
            });
        }       
    }

    AuthWithGoogleUser(user) {
        const credential = firebase.auth.GoogleAuthProvider.credential(user.idToken, user.accessToken)
        this.setState({isLoading: true})
        AsyncStorage.setItem('credential', JSON.stringify(credential), () => {
            
        });
        // login with credential
        return firebase.auth().signInWithCredential(credential)
        .then((currentUser) => {
            if (currentUser) {
                console.log('Google_User', currentUser)
                const photoURL = user.photo.replace('/s96-c/', '/s640-c/')
                this.props.setUserInfo(currentUser, photoURL, () => {
                    this.setState({isLoading: false})
                    this.onLoginSuccess()
                })
            }
        })
        .catch((error) => {
            this.setState({isLoading: false})
            console.log(`Login fail with error: ${error}`)
            alert(JSON.stringify(error.toString()))
        })
        //console.log(user);
    }

    onFacebookLogin() {
        LoginManager
        .logInWithReadPermissions(['public_profile', 'email', 'user_photos'])
        .then((result) => {
            
            if (!result.isCancelled) {
                console.log(`Login success with permissions: ${result.grantedPermissions.toString()}`)
                // get the access token
                return AccessToken.getCurrentAccessToken()
            }
        })
        .then(data => {
            if (data) {
                // create a new firebase credential with the token
                this.setState({isLoading: true})   
                const responseInfoCallback = (error, result) => {
                    if (error) {
                        console.log('Error fetching data: ' + error.toString());
                    } else {
                        console.log('=====Get high pixel image=====', JSON.stringify(result))
                        const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken)
                        AsyncStorage.setItem('credential', JSON.stringify(credential), () => {
                            
                        });
                        // login with credential
                        firebase.auth().signInWithCredential(credential)
                        .then((currentUser) => {
                            if (currentUser) {
                                console.log('Facebook_user', currentUser)                
                                this.props.setUserInfo(currentUser, result.picture.data.url, () => {
                                    this.setState({isLoading: false})
                                    this.onLoginSuccess()
                                })
                            }
                        })
                        .catch((error) => {
                            this.setState({isLoading: false})
                            console.log(`Login fail with error: ${error}`)
                            alert(JSON.stringify(error.toString()))
                        })
                    }
                }

                const infoRequest = new GraphRequest(
                    '/me',
                    {
                        accessToken: data.accessToken,
                        parameters: {
                            fields: {
                                string: 'picture.width(300).height(300)'
                            }
                        }
                    },
                    responseInfoCallback
                );                
                new GraphRequestManager().addRequest(infoRequest).start();
                
            }
        })        
    }

    onClickTerms() {
        this.props.navigation.navigate('terms')
    }

    render(){
        return(
            <View style={styles.container}>
                <Video
                    ref={(ref) => {
                        this.player = ref
                    }} 
                    source={Platform.OS === 'ios' ? VideoiOS : VideoAndroid}
                    style={styles.marker}
                    rate={1.0}
                    volume={1.0}
                    muted={false}
                    resizeMode='cover'
                    repeat={true}
                    onLoadStart={() => console.log('video started')} // Callback when video starts to load
                    onLoad={() => console.log('video loaded')}    // Callback when video loads
                    onProgress={() => console.log('video progress')}    // Callback every ~250ms with currentTime
                    onEnd={() => console.log('video end')}           // Callback when playback finishes
                    onError={() => console.log('video error')} 
                />
                {/* <BlurView
                    style={styles.marker} 
                    viewRef={this.state.viewRef} 
                    blurType="dark" 
                    blurAmount={0} 
                /> */}
                <View style={styles.content}>
                    <Image source={require('../../resource/image/logo.png')} style={styles.logo} />
                    <Text style={styles.logoText}>Nebzy🏡</Text>
                    <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
                        <Text style={styles.emojiText}>See your neighbor🏙🌳</Text>
                    </View>
                    <View style={styles.bottomView}>
                        <View style={styles.buttonView}>
                            <TouchableOpacity onPress={() => this.onFacebookLogin()} style={styles.buttonContainer}>
                                <Image source={require('../../resource/image/facebook_round.png')} style={styles.buttonImage}/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonView}>
                            <TouchableOpacity onPress={() => this.onGoogleLogin()} style={styles.buttonContainer}>
                                <Image source={require('../../resource/image/google_plus.png')} style={styles.buttonImage}/>
                            </TouchableOpacity>
                        </View>
                        {/* <View style={styles.buttonView}>
                            <TouchableOpacity onPress={() => this.onTwitterLogin()} style={styles.buttonContainer}>
                                <Image source={require('../../resource/image/twitter_round.png')} style={styles.buttonImage}/>
                            </TouchableOpacity>
                        </View> */}
                    </View>
                </View>
                {
                    this.state.isLoading?
                    <View style={styles.loadingView}>
                        <WaveIndicator color={Color.white} size={80}/>
                    </View>
                    :null
                }                
            </View>        
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
    },
    background: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        resizeMode: 'cover'
    },
    marker: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        borderWidth: 0,
    },
    content: {
        flex: 1,
        paddingTop: Height * 0.12,
        paddingBottom: Height * 0.15,
        alignItems: 'center'
    },
    logo: {
        width: 60,
        height: 60,
        resizeMode: 'stretch'
    },
    logoText: {
        color: Color.white,
        backgroundColor: 'transparent',
        fontSize: 16,
        padding: 10
    },
    bottomView: {
        height: 80,
        paddingHorizontal: 20,
        flexDirection: 'row'
    },
    buttonView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonContainer: {
        width: 60,
        height: 60
    },
    buttonImage: {
        width: 60,
        height: 60,
        resizeMode: 'stretch'
    },
    loadingView: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0
    },
    emojiText: {
        paddingBottom: 5,
        backgroundColor: 'transparent',
        fontSize: 16,
        color: Color.white
    },
    termButton: {
        marginTop: 20
    }
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    appState: state.appState
  }
}, mapDispatchToProps)(Login);
