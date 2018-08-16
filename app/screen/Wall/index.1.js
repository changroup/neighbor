'use strict';

/*jshint esversion: 6*//*jshint node: true*/
import React, {Component} from 'react'
import {
    View, 
    StyleSheet, 
    findNodeHandle, 
    RefreshControl, 
    Dimensions, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    TouchableWithoutFeedback,
    ScrollView,
    Alert
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import { BlurView, VibrancyView } from 'react-native-blur';
import Color from '../../lib/color.js'
import { Container, Header, Left, Right, Button, Content } from 'native-base'
import CustomHeader from '../../component/header'
import Image from 'react-native-image-progress';

import * as Service from '../../lib/service'
import Icon from 'react-native-vector-icons/Ionicons';
import RNAudioStreamer from 'react-native-audio-streamer';
import { WaveIndicator } from 'react-native-indicators';
import {AudioRecorder, AudioUtils, AudioPlayer} from 'react-native-audio';
import Video from 'react-native-video';
import WallAvatar from './avatar'
import TextWall from './text_wall'

var Sound = require('react-native-sound');

const Height = Dimensions.get('window').height
const Width = Dimensions.get('window').width

export class Wall extends Component{

    constructor(props){
        super(props);
        this.state = {
            walls: {},
            isLoading: false,
            audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
            playingState: 'Audio File',
            deleteIndex: ''
        };
    };

    componentDidMount() {
        this.mounted = true
        this.getWallPosts()
        RNAudioStreamer.status((err, status)=>{
            if(!err) console.log('Audio Status',status)
        })
    }

    componentWillUnmount() {
        this.sound && this.sound.stop()
        this.mounted = false
    }

    getWallPosts() {
        this.setState({isLoading: true})
        this.props.fetchWallDatas(this.props.userInfo, (walls) => {
            this.mounted && this.setState({walls, isLoading: false})
        })
    }

    startAudioTracker() {
        const _this = this
        setTimeout(function(){
            _this.mounted && _this.sound.getCurrentTime((seconds) => _this.setState({playingState: Service.convertDuringTime(seconds)}));
            _this.mounted && _this.startAudioTracker()
        }, 1000)      
    }

    playDownloadedAudio(key) {
        const _this = this
        this.sound = new Sound(this.state.audioPath, '', (error) => {
            if (error) {
                console.log('failed to load the sound', error);
            }
        });
        this.startAudioTracker()
        setTimeout(() => {
            _this.sound.play((success) => {
                _this.mounted && _this.setState({playingIndex: -1})                
            });
        }, 100);        
    }

    onPauseAudio(){
        this.setState({playingIndex: -1})
        this.sound.pause()
    }

    onPlayAudio(key, wall){
        this.setState({playingState: 'downloading...', playingIndex: key})
        const url = Service.getFirebaseAudioURL(wall.audioURL, this.state.audioPath, (result) => {
            this.mounted && this.playDownloadedAudio(key)
        })        
    }

    onPreviewVideo(data) {
        this.props.handle.navigation.navigate('video_preview', {data})
    }

    deletePost(data) {
        Alert.alert(
            'Nebzy🏡',
            '🏢🌴 Are you sure you want to delete this post? 💚🏡 ',
            [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'Yes', onPress: () => {
                    Service.deleteWall(data, this.props.userInfo)
                }},
            ],
            { cancelable: false }
        )
        
    }

    onPressPost(key) {
        if(this.state.deleteIndex == key) this.setState({deleteIndex: ''})
        else this.setState({deleteIndex: key})
    }


    render(){
        const _this = this
        const {walls, isLoading} = this.state
        return(
            <Container style={styles.container}>
                <CustomHeader
                    left='ios-arrow-back'
                    title='🌴🏢🏭🏘🏟🏣🛣🛳🏨🌳'
                    right='ios-create-outline'
                    onPressRight={() => this.props.handle.navigation.navigate('post', {onPost: () => this.getWallPosts()})}
                    onPressLeft={() => this.props.onPressBack()}
                />
                {
                    isLoading?
                    <View style={styles.emptyView}>
                        <WaveIndicator color={Color.green} size={80}/>
                    </View>
                    :Object.keys(walls).length == 0 ?
                    <View style={styles.emptyView}>
                        <Text style={styles.TimeText}>No walls</Text>
                    </View>
                    :
                    <Content padder contentContainerStyle={{paddingBottom: 50}}>
                        {
                            Object.keys(walls).map(function(key, index){
                                const data = walls[key]
                                //render text wall
                                if(data.text == '') return <View />                              
                                return(
                                    <View key={key} style={styles.wallView}>
                                        <WallAvatar 
                                            userId={data.uid}
                                            myLocation={_this.props.myLocation}
                                            me={_this.props.userInfo}
                                        />
                                        <TouchableOpacity delayLongPress={1000} onLongPress={() => _this.onPressPost(key)} style={styles.MsgView}>                 
                                        {
                                            data.text != 'none'?
                                            <TextWall user={data} onLongPressImage={() => _this.onPressPost(key)} handle={_this.props.handle}/>
                                            // <Text style={styles.MsgText}>{data.text}</Text>                               
                                            :data.audioURL.length > 10?
                                            <View>
                                                <View style={[styles.lineView, {justifyContent: 'space-between', padding: 10}]}>
                                                    <View style={styles.lineView}>
                                                    {
                                                        _this.state.playingIndex == key?
                                                        <TouchableOpacity onPress={() => _this.onPauseAudio()} style={styles.playAudioButton}>
                                                            <Icon name='md-pause' size={30} color={Color.text} />
                                                        </TouchableOpacity>
                                                        :
                                                        <TouchableOpacity onPress={() => _this.onPlayAudio(key, data)} style={styles.playAudioButton}>
                                                            <Icon name='md-play' size={30} color={Color.text} />
                                                        </TouchableOpacity>
                                                    }
                                                    {
                                                        _this.state.playingIndex == key?
                                                        <Text style={styles.audioText}>{_this.state.playingState}</Text>
                                                        :<Text style={styles.audioText}></Text>
                                                    }
                                                    </View>  
                                                    <View style={styles.lineView}>
                                                        <Icon name='md-volume-up' size={30} color={Color.text} />
                                                    </View>                                   
                                                </View>
                                            </View>
                                            :data.videoURL.length > 10?
                                            <TouchableOpacity onPress={() => _this.onPreviewVideo(data)} style={[styles.lineView, {justifyContent: 'space-between'}]}>
                                                <View style={styles.lineView}>
                                                    <Icon name='md-play' size={30} color={Color.text} />
                                                </View>  
                                                <View style={styles.lineView}>
                                                    <Icon name='md-videocam' size={30} color={Color.text} />
                                                </View>                                   
                                            </TouchableOpacity>
                                            :null
                                        }
                                        </TouchableOpacity>
                                        {
                                            _this.state.deleteIndex == key?
                                            <View style={styles.actionView}>
                                                <TouchableOpacity onPress={() => _this.deletePost(data)}>
                                                <Icon name='ios-trash-outline' style={styles.actionIcon} />
                                                </TouchableOpacity>
                                            </View>
                                            :null
                                        }                                                
                                    </View>
                                )
                            })
                        }
                    </Content>
                }
                
            </Container>        
        );
    };
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Color.white,
    },    
    wallView: {
        alignItems: 'center',
        marginBottom: 20
    },
    emptyView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    wallTopView: {
        alignItems: 'center',
        marginBottom: 10
    },
    MsgView: {
        backgroundColor: 'transparent',
        borderRadius: 8,
        borderWidth: 2.5,
        borderColor: Color.blue,
        width: Width - 20,
        marginTop: 10
    },
    lineView: {
        flexDirection: 'row',
        alignItems: 'center'
    },    
    audioText: {
        color: Color.text,
        lineHeight: 20,
        fontSize: 16,
        paddingLeft: 10
    },
    TimeText: {
        color: Color.darkgray,
        fontSize: 10,
        paddingLeft: 10
    },
    actionView: {
        padding: 10,
        width: Width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    actionIcon: {
        color: Color.text,
        fontSize: 20,
        marginHorizontal: 10,
    },
    MsgText: {
        color: Color.text,
        fontSize: 14,
        lineHeight: 20,
        padding: 15
    },
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    appState: state.appState,
    userInfo: state.userInfo,
    myLocation: state.myLocation,
  }
}, mapDispatchToProps)(Wall);
