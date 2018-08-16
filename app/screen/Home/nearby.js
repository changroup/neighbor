'use strict';

/*jshint esversion: 6*//*jshint node: true*/
import React, {Component} from 'react'
import {View, StyleSheet, Alert, findNodeHandle, Platform, PermissionsAndroid, Dimensions, ScrollView} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import Color from '../../lib/color.js'
import { Container } from 'native-base'
import {GoogleSignin} from 'react-native-google-signin';

import CustomHeader from '../../component/header'
import Image from 'react-native-image-progress';
import { WaveIndicator } from 'react-native-indicators';
import * as Service from '../../lib/service'
import HomeAvatar from './avatar'
import { NavigationActions } from 'react-navigation'


const Height = Dimensions.get('window').height
const Width = Dimensions.get('window').width

export class NearBy extends Component{

    constructor(props){
        super(props);
        this.state = {
            NBUsers: [],
            isLoading: true,
        };
    };

    componentDidMount() {
        //blur background Image
        this.mounted = true
        const {userInfo} = this.props
        this.setState({ viewRef: findNodeHandle(this.backgroundImage) });

        if(Platform.OS === 'ios') this.props.startWatchPosition(this.props.userInfo)
        else this.requestLocationPermission()        

        this.props.configureNotificationHandle()

        Service.configurePushNotification(userInfo)
    }

    componentWillUnmount() {
        this.mounted = false
    }

    async requestLocationPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              'title': 'Location Permission',
              'message': 'Neighbor App needs access to your location'
            }
          )
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("App can access your location")
            this.props.startWatchPosition(this.props.userInfo)
          } else {
            console.log("Location permission denied")
          }
        } catch (err) {
          console.warn(err)
        }
      }
    
    onLogOut() {
        Alert.alert(
            'Nebzy🏡',
            '🏢🌴 ' + this.props.userInfo.displayName.split(' ')[0] + ', do you really want to go? 💚🏡 ',
            [
                {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'Yes', onPress: () => {
                    this.props.signOut(this.props.userInfo, () => {       
                        const resetAction = NavigationActions.reset({
                            index: 0,
                            actions: [
                                NavigationActions.navigate({ routeName: 'login', params: {autoLogin: false}})
                            ]
                        })
                        GoogleSignin.signOut()
                        .then(() => {
                            this.props.handle.navigation.dispatch(resetAction)
                        })
                        .catch((err) => {
                            alert(err.toString())
                        });                        
                    })
                }},
            ],
            { cancelable: false }
        )        
    }

    onWallClick() {
        this.props.onPressWall()
    }

    onClickUser(user) {
        this.mounted && this.props.handle.navigation.navigate('profile', {user: user})      
    }

    onLikeUser(user) {
        alert('comming soon')
    }

    render(){
        const _this = this
        const {nearByUsers } = this.props
        return(
            <Container>
                <CustomHeader
                    left='md-close'
                    title='🌴🏢🏟🛣🛳🏨🌳'
                    right='md-arrow-forward'
                    onPressLeft={() => this.onLogOut()}
                    onPressRight={() => this.onWallClick()}
                />          
                 
                <View style={{flex: 1, position: 'relative'}}>
                    <Image 
                        ref={(img) => { this.backgroundImage = img; }} 
                        imageStyle={styles.background}
                        source={require('../../resource/image/home_back.jpg')}                 
                    />
                    {/* <BlurView 
                        style={styles.marker} 
                        viewRef={this.state.viewRef} 
                        blurType="dark" 
                        blurAmount={0.1} 
                    /> */}
                    <ScrollView style={{flex: 1}} contentContainerStyle={{paddingBottom: 20}}>
                    {
                        nearByUsers.length == 0?
                        <View style={styles.loadingView}>
                            <WaveIndicator color={Color.green} size={80}/>
                        </View>
                        :
                        <View style={styles.scrollView}>
                        {
                            nearByUsers.map(function(user, index){
                                let isLike = false
                                let badge = 0
                                return(          
                                    <HomeAvatar 
                                        key={index} 
                                        user={user} 
                                        like={false}
                                        onPress={(user) => _this.onClickUser(user)}
                                        onDoubleClick={() => alert('hi')}
                                    />  
                                )
                            })
                        }
                        </View>
                    }                        
                    </ScrollView>
                </View>
            </Container>        
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
    loadingView: {
        width: Width,
        height: Height - 80,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        backgroundColor: 'transparent',
        color: Color.white
    },
    marker: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        borderWidth: 0
    },
    scrollView: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    userItem: {
        width: Width * 0.3,
        height: Width * 0.3,
        margin: Width * 0.016,
    },
    userImage: {
        width: Width * 0.3,
        height: Width * 0.3,
        borderRadius: Width * 0.3,
        overflow: 'hidden'
        //resizeMode: 'stretch',
    }
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    appState: state.appState,
    userInfo: state.userInfo,
    myLocation: state.myLocation,
    nearByUsers: state.nearByUsers,    
  }
}, mapDispatchToProps)(NearBy);
