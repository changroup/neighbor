'use strict';

/*jshint esversion: 6*//*jshint node: true*/
import React, {Component, PropTypes} from 'react'
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../redux/action'
import Image from 'react-native-image-progress';
import ProgressBar from 'react-native-progress/Circle';
import Color from '../lib/color.js'
import * as Service from '../lib/service'

export class Avatar extends Component{

    constructor(props){
        super(props);
        this.state = {
            url: '',
            userId: '',
            failedImage: '',
            user: {}
        };
    };

    static propTypes = {
        userId: PropTypes.string,
        photoURL: PropTypes.string,
        width: PropTypes.number,
    }

    static defaultProps = {
        photoURL: undefined,
        userId: undefined,
        width: 40,
    }

    componentDidMount() {
        this.mounted = true
        this.getProfileImage()
    }

    getProfileImage() {
        if(this.props.userId == undefined) return
        Service.getUserData(this.props.userId, (user) => {
            this.mounted && this.setState({
                failedImage: false, 
                url: user.photoURL, 
                userId: user.uid, 
                user
            })
        })  
    }

    componentWillUnmount() {
        this.mounted = false
    }

    static propTypes = {
        userId: PropTypes.string.isRequired
    }

    static defaultProps = {
        userId: ''
    }

    render(){
        const { user, failedImage, url } = this.state
        const {width, photoURL, userId} = this.props
        const letter = user.displayName == undefined ? '' : user.displayName.substring(0,1).toUpperCase()
        if(userId !== undefined && this.state.userId !== userId) this.getProfileImage()
        const imageStyle = {
            width,
            height: width,
            borderRadius: width / 2,
            overflow: 'hidden',
        }
        const letterStyle = {
            fontSize: width / 2,
            color: Color.white
        }
        return(
            <View style={[imageStyle, {position: 'relative'}]}>
                <View style={[imageStyle, styles.letterContainer, {backgroundColor: user.providerId === 'google.com' ? '#F53E28' : '#3B5999'}]}>
                    <Text style={letterStyle}>{letter}</Text>
                </View>
                {
                    photoURL !== undefined ? 
                    <Image 
                        onError={(e) => this.setState({failedImage: true})}
                        source={{uri: photoURL}} 
                        indicator={ProgressBar} 
                        imageStyle={imageStyle}
                    />
                    :
                    url === undefined ? 
                    null
                    :
                    <Image 
                        onError={(e) => this.setState({failedImage: true})}
                        source={{uri: url}} 
                        indicator={ProgressBar} 
                        imageStyle={imageStyle}
                    />
                }
            </View>
        );
    };
}

const styles=StyleSheet.create({
    infoView: {
        flex: 1
    },
    infoText: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        color: Color.text
    },    
    letterContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    userInfo: state.userInfo,
    myLocation: state.myLocation
  }
}, mapDispatchToProps)(Avatar);
