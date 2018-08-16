'use strict';

/*jshint esversion: 6*//*jshint node: true*/
import React, {Component} from 'react'
import {View, Image, StyleSheet, Alert, findNodeHandle, Platform, Dimensions, Text, TouchableOpacity} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import Color from '../../lib/color.js'
import { Container } from 'native-base'
import GestureRecognizer from 'react-native-swipe-gestures';

import DoubleClickView from '../../component/doubleClick'
import CustomHeader from '../../component/header'
import Avatar from '../../component/avatar'
import ProgressImage from 'react-native-image-progress';
import ProgressBar from 'react-native-progress/Circle';
import * as Service from '../../lib/service'

const Width = Dimensions.get('window').width

export class Profile extends Component{

    constructor(props){
        super(props);
        this.state = {
            user: this.props.navigation.state.params.user,
            likeNumber: '0',
        };
    };

    componentDidMount() {
        //blur background Image
        this.mounted = true
        this.refresh()
        //alert(JSON.stringify(this.props.me))
        if(this.state.user.photoURL == undefined){
            Service.getUserData(this.state.user.uid, (user) => {
                this.setState({user})
            })
        }
        this.setState({ viewRef: findNodeHandle(this.backgroundImage)});
    }

    componentWillUnmount() {
        this.mounted = false
    }

    refresh() {
        Service.getLikeUsers(this.state.user.uid, (likeUsers) => {
            if(this.props.me.uid === this.state.user.uid) this.props.setLikeUsers(likeUsers)
            else this.setState({likeNumber: likeUsers.length})
        })
    }

    onStartChat(){
        const {user} = this.state
        if(user.uid == this.props.me.uid){
            this.props.navigation.navigate('message_list')
        }
        else{
            Service.removeBadgeForUser(user.uid, this.props.me)  
            this.props.joinChatRoom(this.props.me.uid, user.uid, (roomID) => {
                this.props.navigation.navigate('chat', {userId: user.uid, roomID})
            }) 
        }             
    }

    onSwipeRight(gestureState) {
        this.props.navigation.goBack()
    }

    onClickHeart() {
        this.props.me.uid == this.state.user.uid &&
        this.props.navigation.navigate('likeUsers', {onBack: () => this.refresh()})
    }
    
    onClickBlock() {
        if(this.state.user.uid === this.props.me.uid){
            this.props.navigation.navigate('blockUsers', {onBack: () => this.refresh()})
        }
        else{
            Alert.alert(
                'Nebzy🏡',
                this.props.me.displayName.split(' ')[0] + ', do you really want to block ' + this.state.user.displayName.split(' ')[0] + ' ? 🙊🙈',
                [
                    {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'Yes', onPress: () => {
                        Service.blockUser(this.state.user.uid, this.props.me)
                    }},
                ],
                { cancelable: false }
            )    
        }    
    }

    onLike() {
        Service.likeUser(this.state.user.uid, this.props.me)
    }

    onUnblock() {
        Service.unblockUser(this.state.user.uid, this.props.me)
    }

    render(){
        const {user, likeNumber} = this.state
        const {me, likeUsers, myBadgeNumber} = this.props
        const config = {
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80
        };
        return(
            <Container>
                <CustomHeader
                    left='ios-arrow-back'
                    title='🌴🏢🏟🛣🛳🏨🌳'
                    onPressLeft={() => this.props.navigation.goBack()}
                />
                <GestureRecognizer 
                    onSwipeRight={(state) => this.onSwipeRight(state)}
                    config={config}
                    style={{flex: 1, position: 'relative'}}
                >
                    <ProgressImage 
                        ref={(img) => { this.backgroundImage = img; }}
                        style={styles.background}
                        indicator={ProgressBar} 
                        source={{uri: user.photoURL}}
                        blurRadius={Platform.OS === 'ios' ? 20 : 10}            
                    />
                    {/* <BlurView 
                        style={styles.marker} 
                        viewRef={this.state.viewRef} 
                        blurType="dark" 
                        blurAmount={25} 
                    /> */}
                    
                    <View style={styles.innerView}>
                        <View style={styles.userImage}>
                            <Avatar 
                                userId={user.uid}
                                width={Width * 0.9}
                            />
                        </View>
                    </View>
                    {                        
                        me.blockUsers == undefined || me.blockUsers.indexOf(user.uid) < 0 ?
                        <View style={styles.bottomView}>
                            <TouchableOpacity onPress={() => this.onClickBlock()} style={styles.borderIcon}>
                                <Text style={styles.blockIcon}>❌</Text>
                            </TouchableOpacity>
                            <View style={{position: 'relative'}}>
                                <TouchableOpacity onPress={() => this.onStartChat()}>
                                    <Image 
                                        source={require('../../resource/image/mailbox.png')}
                                        style={styles.buttonImage}
                                    />
                                </TouchableOpacity>
                                {
                                    me.uid !== user.uid || myBadgeNumber == 0? null
                                    :
                                    <View style={styles.badgeView}>
                                        <Text style={styles.badgeText}>{myBadgeNumber}</Text>
                                    </View>
                                }
                            </View>
                            <DoubleClickView 
                                style={[styles.likeView, styles.borderIcon]}
                                onClick={() => this.onClickHeart()}
                                onDoubleClick={() => this.onLike()}                                
                            >
                                <View style={[styles.likeView, styles.borderIcon]}>
                                    <Text style={styles.likeIcon}>💚</Text>
                                    <View style={styles.likeNumberView}>
                                        <Text style={styles.likeNumber}>{user.uid === me.uid ? likeUsers.length : likeNumber}</Text>
                                    </View>
                                </View>
                            </DoubleClickView>                         
                        </View>
                        :
                        <View style={styles.bottomView}>
                            <View />
                            <TouchableOpacity onPress={() => this.onUnblock()}>
                                <Image 
                                    source={require('../../resource/image/unblock.png')}
                                    style={styles.buttonImage}
                                />
                            </TouchableOpacity>
                            <View />
                        </View>
                    }                    
                </GestureRecognizer>
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
    },
    marker: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        borderWidth: 0,
        //backgroundColor: 'red'
    },
    userImage: {
        borderColor: Color.blue,
        borderWidth: 0.5,
        borderRadius: Width * 0.45
    },
    innerView: {
        alignItems: 'center',
        paddingTop: 60
    },
    infoText: {
        textAlign: 'center',
        padding: 10,
        color: Color.white,
        backgroundColor: 'transparent',
        fontSize: 20
    },
    bottomView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 40
    },
    buttonImage: {
        width: 80,
        height: 80,
        overflow: 'hidden'
    },
    iconImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain'
    },
    likeView: {
        position: 'relative', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    blockIcon: {
        fontSize: 30,
        backgroundColor: 'transparent'
    },
    likeIcon: {
        fontSize: 36,
        backgroundColor: 'transparent'
    },
    likeNumberView: {
        position: 'absolute', 
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'center', 
        alignItems: 'center'
    },
    likeNumber: {
        textAlign: 'center',
        backgroundColor: 'transparent',
        color: 'blue'
    },
    badgeView: {
        position: 'absolute',
        right: 3,
        top: 3,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        backgroundColor: 'red',
        borderRadius: 12
    },
    badgeText: {
        textAlign: 'center',
        color: Color.white,
        backgroundColor: 'transparent'
    },
    borderIcon: {
        width: 75,
        height: 75,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        borderWidth: 0.5,
        borderColor: Color.blue
    }
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    appState: state.appState,
    me: state.userInfo,
    myLocation: state.myLocation,
    likeUsers: state.likeUsers,
    myBadge: state.myBadge,
    myBadgeNumber: state.myBadgeNumber
  }
}, mapDispatchToProps)(Profile);
