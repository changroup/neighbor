import React, {Component, PropTypes} from 'react'
import {
    View, 
    StyleSheet, 
    Dimensions, 
    Text, 
    TouchableOpacity, 
    DeviceEventEmitter
} from 'react-native'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Icon from 'react-native-vector-icons/Ionicons';
import RNAudioStreamer from 'react-native-audio-streamer';
import { AudioUtils } from 'react-native-audio';
import { ActionCreators } from '../../redux/action'
import * as Service from '../../lib/service'
import ImageMessage from './image'
import Avatar from '../../component/avatar'
import Color from '../../lib/color.js'

var Sound = require('react-native-sound');

const Width = Dimensions.get('window').width

class Message extends Component{
    constructor(props){
        super(props);
        this.state = {
            playing: false,
            playingState: 'Audio File',
            audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
        };
    }

    static propTypes = {
        data: PropTypes.object.isRequired,
        onPressImage: PropTypes.func
    }

    static defaultProps = {
        onPressImage: () => undefined
    }

    componentDidMount() {
        this.mounted = true
        this.subscription = DeviceEventEmitter.addListener('RNAudioStreamerStatusChanged', this._statusChanged.bind(this));
    }

    componentWillUnmount() {
        this.mounted = false
    }

    _statusChanged(status) {
        console.log('Audio status: ', status)
        if(status === 'FINISHED') {
            this.setState({playing: false})
            RNAudioStreamer.pause()
        }
    }

    onPressImage() {
        this.setState({isPressed: true})
    }

    onPauseAudio(){
        this.setState({playing: false})
        RNAudioStreamer.pause()
    }

    onPlayAudio(data){
        this.setState({playingState: 'downloading...', playing: true})
        Service.getFirebaseAudioURL(data.audio, (url) => { 
            console.log('Audio URL', url)
            RNAudioStreamer.setUrl(url);                
            RNAudioStreamer.seekToTime(0);
            RNAudioStreamer.play();
            RNAudioStreamer.duration((err, duration)=>{
                if(!err) console.log('Audio duration', duration) //seconds
            })
            this.startAudioTracker()
        })
    }

    startAudioTracker() {
        const _this = this
        setTimeout(function(){
            _this.mounted && RNAudioStreamer.currentTime((err, currentTime)=>{
                console.log('Audio Playing...', currentTime)
                _this.setState({playingState: Service.convertDuringTime(currentTime)})
            })
            _this.mounted && _this.startAudioTracker()
        }, 1000)      
    }

    playDownloadedAudio() {
        const _this = this
        this.sound = new Sound(this.state.audioPath, '', (error) => {
            if (error) {
                console.log('failed to load the sound', error);
            }
            this.startAudioTracker()
            setTimeout(() => {
                _this.sound.play((success) => {
                    _this.mounted && _this.setState({playing: false, playingState: 'Audio File'})                
                });
            }, 100);
        });
               
    }

    render() {
        const {data, userInfo} = this.props
        const { playing } = this.state
        if(data.uid == userInfo.uid){
            //render right bubble
            return(
                <View style={styles.rightView}>
                    {
                        data.audio !== undefined ?
                        <View style={styles.rightMsgView}>
                            <View style={styles.audioLineView}>
                                {
                                    playing?
                                    <TouchableOpacity onPress={() => this.onPauseAudio()} style={styles.playAudioButton}>
                                        <Icon name='md-pause' size={30} color={Color.text} />
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity onPress={() => this.onPlayAudio(data)} style={styles.playAudioButton}>
                                        <Icon name='md-play' size={30} color={Color.text} />
                                    </TouchableOpacity>
                                }
                                <Text style={styles.audioText}>{playing ? this.state.playingState : 'Audio File'}</Text>                     
                            </View>
                            <View style={styles.audioLineView}>
                                <Icon name='md-volume-up' size={20} color={Color.text} />
                                <Text style={styles.rightTimeText}>{Service.convertToDayTime(data.timestamp)}</Text>
                            </View> 
                        </View>
                        : data.text == 'none'?
                        <ImageMessage 
                            data={data} 
                            direction='right' 
                            time={data.timestamp}
                            onPressImage={() => this.props.onPressImage(data.image)} 
                        />
                        :
                        <View style={styles.rightMsgView}>
                            <Text style={styles.rightMsgText}>{data.text}</Text>
                            <Text style={styles.rightTimeText}>{Service.convertToDayTime(data.timestamp)}</Text>
                        </View>
                    }                    
                    <Avatar 
                        userId={data.uid}
                        width={30}
                    />
                </View>
            )
        }
        else{
            return(
                <View style={styles.leftView}>
                    <Avatar 
                        userId={data.uid}
                        width={30}
                    />
                    {
                        data.audio !== undefined ?
                        <View style={styles.leftMsgView}>
                            <View style={styles.audioLineView}>
                                {
                                    playing?
                                    <TouchableOpacity onPress={() => this.onPauseAudio()} style={styles.playAudioButton}>
                                        <Icon name='md-pause' size={30} color={Color.text} />
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity onPress={() => this.onPlayAudio(data)} style={styles.playAudioButton}>
                                        <Icon name='md-play' size={30} color={Color.text} />
                                    </TouchableOpacity>
                                }
                                <Text style={[styles.audioText, {color: Color.gray}]}>{playing ? this.state.playingState : 'Audio File'}</Text>                     
                            </View>
                            <View style={styles.audioLineView}>
                                <Icon name='md-volume-up' size={20} color={Color.text} />
                                <Text style={styles.leftTimeText}>{Service.convertToDayTime(data.timestamp)}</Text>
                            </View> 
                        </View>
                        : data.text == 'none'?
                        <ImageMessage 
                            data={data} 
                            direction='left'  
                            time={data.timestamp}
                            onPressImage={(url) => this.props.onPressImage(url)} 
                        />
                        :
                        <View style={styles.leftMsgView}>
                            <Text style={styles.leftMsgText}>{data.text}</Text>
                            <Text style={styles.leftTimeText}>{Service.convertToDayTime(data.timestamp)}</Text>
                        </View>  
                    }                  
                </View>
                
            )
        }
        
    }

}

const styles = StyleSheet.create({
    rightView: {
        marginBottom: 15,
        marginLeft: Width * 0.4,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        //alignItems: 'center'
    },
    leftView: {
        marginBottom: 15,
        marginRight: Width * 0.4,
        flexDirection: 'row'
    },
    rightMsgView: {
        borderRadius: 10,
        borderTopRightRadius: 0,
        backgroundColor: Color.gray,
        marginRight: 10,
        padding: 10
    },
    rightImageView: {

    },
    leftMsgView: {
        borderRadius: 10,
        borderTopLeftRadius: 0,
        backgroundColor: Color.darkgreen,
        marginLeft: 10,
        padding: 10
    },
    rightMsgText: {
        color: Color.black,
        lineHeight: 20,
        marginBottom: 6
    },
    leftMsgText: {
        color: Color.white,
        lineHeight: 20,
        marginBottom: 6
    },
    rightTimeText: {
        color: Color.darkgray,
        textAlign: 'right',
        fontSize: 10,
    },
    leftTimeText: {
        color: Color.gray,
        fontSize: 10,
    },
    photo: {
        width: 30,
        height: 30,
        borderRadius: 30,
        overflow: 'hidden'
    },
    audioLineView: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: 5
    },
    audioText: {
        color: Color.text,
        lineHeight: 20,
        fontSize: 16,
        paddingLeft: 10
    },
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    userInfo: state.userInfo,
  }
}, mapDispatchToProps)(Message);