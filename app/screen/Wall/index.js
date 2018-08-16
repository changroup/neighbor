'use strict';

/*jshint esversion: 6*//*jshint node: true*/
import React, {Component} from 'react'
import {
    View, 
    StyleSheet, 
    Dimensions, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ListView,
    Platform,
    PermissionsAndroid,
    FlatList
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import Color from '../../lib/color.js'
import CustomHeader from '../../component/header'
import Image from 'react-native-image-progress';
import { KeyboardAwareView } from 'react-native-keyboard-aware-view'
import RNFetchBlob from 'react-native-fetch-blob'


import * as Service from '../../lib/service'
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { WaveIndicator } from 'react-native-indicators';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import { ifIphoneX } from 'react-native-iphone-x-helper'
import WallAvatar from './avatar'
import TextWall from './text_wall'

var Sound = require('react-native-sound');
var ImagePicker = require('react-native-image-picker');
const Width = Dimensions.get('window').width
const sampleAudioURL = 'https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3'
Sound.setCategory('Playback');

export class Wall extends Component{

    constructor(props){
        super(props);
        this.state = {
            walls: {},
            isLoading: false,
            playingState: 'Audio File',
            deleteIndex: '',
            comment: '',
            attachImage: {uri: 'none'},
            audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
            audioFilePath: '',
            recording: false,
            hasPermission: undefined,
            stoppedRecording: false,
            isAttaching: false,
            currentTime: 0,
            videoFilePath: '',
            audioURL: sampleAudioURL,
            playingIndex: -1,
            keyStr: ''
        };
    };

    componentDidMount() {
        this.mounted = true
        this.getWallPosts()
        Platform.OS === 'android' && this._checkPermission().then((hasPermission) => {
            this.setState({ hasPermission });
            console.log('Audio permission', hasPermission)
            if (!hasPermission) return;

            this.prepareRecordingPath(this.state.audioPath);

            AudioRecorder.onFinished = (data) => {
                // Android callback comes in the form of a promise instead.
                if (Platform.OS === 'ios') {
                    this._finishRecording(data.status === "OK", data.audioFileURL);
                }
                this.setState({recording: true})
            };
        });
    }

    _checkPermission() {
        if (Platform.OS !== 'android') {
            return Promise.resolve(true);
        }
  
        const rationale = {
            'title': 'Microphone Permission',
            'message': 'NearBy app needs access to your microphone so you can record audio.'
        };
  
        return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
        .then((result) => {
            console.log('Permission result:', result);
            return (result === true || result === PermissionsAndroid.RESULTS.GRANTED);
        });
    }

    prepareRecordingPath(audioPath){
        AudioRecorder.prepareRecordingAtPath(audioPath, {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "Low",
            AudioEncoding: "aac",
            AudioEncodingBitRate: 32000,
        });
    }

    _finishRecording(didSucceed, filePath) {
        this.setState({ finished: didSucceed });
        console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath}`);
        this.setState({audioFilePath: filePath, recording: false})
    }

    componentWillUnmount() {
        this.sound && this.sound.stop()
        this.mounted = false
        this.state.recording && this.prepareRecordingPath(this.state.audioPath);
    }

    getWallPosts() {
        this.setState({isLoading: true})
        this.props.fetchWallDatas(this.props.myLocation, this.props.userInfo, (walls) => {
            this.mounted && this.setState({walls, isLoading: false})
        })
    }

    startAudioTracker() {
        const _this = this
        console.log('PlayingIndex: ', this.state.playingIndex)
        setTimeout(function(){
            _this.sound.getCurrentTime((seconds) => {
                console.log('Audio Duration Time: ', seconds)
                _this.setState({playingState: Service.convertDuringTime(seconds)})
            });
            _this.startAudioTracker()
        }, 1000)      
    }

    playDownloadedAudio(audioPath, base) {
        const _this = this
        this.sound = new Sound(audioPath, base, (error) => {
            if (error) {
                console.log('failed to load the sound', error);
                alert(JSON.stringify(error))
                return
            }
            console.log('Audio loaded successfully')                    
        });
        setTimeout(() => {
            console.log('Sound detail', _this.sound)
            _this.sound.setVolume(0.5);
            _this.sound.setCurrentTime(0);
            // Position the sound to the full right in a stereo field
            // Loop indefinitely until stop() is called
            _this.sound.setNumberOfLoops(0); 
            _this.sound.play((success) => {
                if (success) {
                    console.log('successfully finished playing');
                } else {
                    console.log('playback failed due to audio decoding errors');
                    // reset the player to its uninitialized state (android only)
                    // this is the only option to recover after an error occured and use the player again
                    _this.sound.reset();
                }
                _this.mounted && _this.setState({playingIndex: -1})                
            });                       
            //_this.startAudioTracker()
            _this.mounted && _this.setState({playingState: 'Playing...'})      
        }, 3000)    
    }

    onPauseAudio(){
        this.setState({playingIndex: -1})
        this.sound && this.sound.pause()
    }

    // Service.getFirebaseAudioURL(wall.audioURL, (url) => { 
    //     console.log('Audio URL', url)
    //     RNAudioStreamer.setUrl(url);                
    //     RNAudioStreamer.seekToTime(0);
    //     RNAudioStreamer.play();
    //     RNAudioStreamer.duration((err, duration)=>{
    //         if(!err) console.log('Audio duration', duration) //seconds
    //     })
    //     this.startAudioTracker()
    // })

    onPlayAudio(key, wall){
        const _this = this
        this.setState({playingState: 'downloading...', playingIndex: key})
        // Service.getFirebaseAudioURL(wall.audioURL, (url) => { 
        //     console.log('Audio URL', url)
        //     const callback = (error, sound) => {
        //         if (error) {
        //             Alert.alert('error', error.message);
        //             _this.setState({playingIndex: -1})
        //             return;
        //         }
        //         sound.play(() => {
        //             // Success counts as getting to the end
        //             // Release when it's done so we're not using up resources
        //             _this.setState({playingIndex: -1})
        //             sound.release();
        //         });
        //     };
        //     const sound = new Sound(url, undefined, error => callback(error, sound));
        // })

        Service.downloadFirebaseAudio(wall.audioURL, RNFetchBlob.fs.dirs.DocumentDir + '/downloadedAudio.aac', (res) => {
            this.playDownloadedAudio('downloadedAudio.aac', RNFetchBlob.fs.dirs.DocumentDir)            
        })
    }

    onPreviewVideo(data) {
        this.props.handle.navigation.navigate('video_preview', {data})
    }

    deletePost(data) {
        Service.deleteWall(data, this.props.userInfo)
        this.setState({deleteIndex: ''})
    }

    onPressPost(key, wall) {
        this.props.setCommentCount(wall)
        if(this.state.deleteIndex == key) this.setState({deleteIndex: ''})
        else this.setState({deleteIndex: key})
    }

    replyPost(wall) {
        this.props.handle.navigation.navigate('comment', {wallID: wall.uid + wall.timestamp})
    }    

    renderWallRow(Item) {
        //alert(JSON.stringify(Item))
        const data = Item.item
        const key = data.key
        if(data.videoURL.length > 10) return null
        if(Platform.OS === 'ios' && data.audioURL.length > 10) return null
        return (
            <View key={key} style={styles.wallView}>
                {
                    this.state.keyStr.indexOf(key) < 0 ?
                    <View style={{height: 50}} />
                    :
                    <WallAvatar
                        wall={data}
                        myLocation={this.props.myLocation}
                        me={this.props.userInfo}
                        onClickUser={() => this.props.handle.navigation.navigate('profile', {user: data})}
                    />
                }   
                <View style={{position: 'relative', padding: 10}}>
                <TouchableOpacity delayLongPress={1000} onLongPress={() => this.onPressPost(key, data)} style={styles.MsgView}>                 
                {
                    data.audioURL.length > 10?
                    <View>
                        <View style={[styles.lineView, {justifyContent: 'space-between', padding: 10}]}>
                            <View style={styles.lineView}>
                            {
                                this.state.playingIndex == key?
                                <TouchableOpacity onPress={() => this.onPauseAudio()}>
                                    <Icon name='md-pause' size={30} color={Color.text} />
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={() => this.onPlayAudio(key, data)}>
                                    <Icon name='md-play' size={30} color={Color.text} />
                                </TouchableOpacity>
                            }
                            {
                                this.state.playingIndex == key?
                                <Text style={styles.audioText}>{this.state.playingState}</Text>
                                :<Text style={styles.audioText}></Text>
                            }
                            </View>  
                            <View style={styles.lineView}>
                                <Icon name='md-volume-up' size={30} color={Color.text} />
                            </View>                                   
                        </View>
                    </View>
                    :data.videoURL.length > 10?
                    <View>
                        <TouchableOpacity 
                            onPress={() => this.onPreviewVideo(data)} 
                            style={[
                                styles.lineView, 
                                {
                                    justifyContent: 'space-between', 
                                    padding: 15,
                                    borderBottomWidth: 1,
                                    borderColor: Color.blue
                                }
                            ]}
                        >
                            <View style={styles.lineView}>
                                <Icon name='md-play' size={30} color={Color.text} />
                            </View>  
                            <View style={styles.lineView}>
                                <Icon name='md-videocam' size={30} color={Color.text} />
                            </View>                              
                        </TouchableOpacity>
                        <Text style={styles.MsgText}>{data.text}</Text>  
                    </View>
                    :
                    //data.text != 'none'?
                    <TextWall 
                        wallData={data} 
                        onLongPressImage={() => this.onPressPost(key, data)} 
                        handle={this.props.handle}
                        keyStr={this.state.keyStr}
                    />
                    // <Text style={styles.MsgText}>{data.text}</Text> 
                }
                       
                </TouchableOpacity>
                {
                    data.comments === undefined || data.comments === 0 ? null
                    :
                    <View style={styles.commentView}>                        
                        <TouchableOpacity onPress={() => this.replyPost(data)}>
                            <Text style={styles.commentText}>{data.comments}</Text>
                        </TouchableOpacity>                        
                    </View>   
                }   
                </View>                 
                {
                    this.state.deleteIndex == key?
                    <View style={styles.actionView}>
                        <View style={styles.lineView}>
                            <TouchableOpacity onPress={() => this.deletePost(data)}>
                                <MaterialIcon name='delete-forever' color={Color.gray} size={22} style={{marginHorizontal: 5, marginBottom: 2}}/>
                            </TouchableOpacity> 
                            <Text style={styles.TimeText}>{Service.getTimeAgo(data.timestamp)}</Text>
                        </View>
                        <View>
                            <TouchableOpacity onPress={() => this.replyPost(data)} >
                                <MaterialIcon name='chat' color={Color.gray} size={20} style={{marginHorizontal: 5}} />
                            </TouchableOpacity>                             
                        </View>                                             
                    </View>
                    :null
                }                                                
            </View>
        )
    }

    onAddImage() {
        var options = {
            title: 'Select Image',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            }
        };        
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);           
            if (response.didCancel) {
                console.log('User cancelled image picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                let source = { uri: response.uri };
                this.setState({attachImage: source, audioFilePath: '', recording: false})
            }
        });
    }

    async _stop() {
        if (!this.state.recording) {
            console.warn('Can\'t stop, not recording!');
            return;
        }  
        this.setState({stoppedRecording: true});  
        try {
            const filePath = await AudioRecorder.stopRecording();
            if(Platform.OS === 'android') {
                this._finishRecording(true, filePath);
            }
            return filePath;
        } catch (error) {
            console.error(error);
        }
    }

    async _record() {
        if (this.state.recording) {
            console.log('Already recording!');
            return;
        }  
        if (!this.state.hasPermission) {
            console.warn('Can\'t record, no permission granted!');
            return;
        }  
        if(this.state.stoppedRecording){
            this.prepareRecordingPath(this.state.audioPath);
        }  
        this.setState({recording: true});  
        try {
            const filePath = await AudioRecorder.startRecording();
            this.setState({currentTime: 0})
            this.startRecording()
        } catch (error) {
            console.error(error);
        }
    }

    startRecording() {
        const _this = this
        setTimeout(function(){
            if(_this.mounted && !_this.state.stoppedRecording){
                _this.setState({currentTime: _this.state.currentTime + 1})
                _this.startRecording()
            } 
        }, 1000) 
    }

    onRecordAudio() {
        this.setState({recording: true, attachImage: {uri: 'none'}, videoFilePath: '', stoppedRecording: false})
        this._record()
    }

    onRecordVideo() {
        this.setState({attachImage: {uri: 'none'}, audioFilePath: ''})
        this.props.handle.navigation.navigate('video_record', {onRecorded: (data) => this.onRecorded(data)})
    }

    onRecorded(data) {
        this.setState({videoFilePath: data.path})
    }

    async onSendWall() {
        const _this = this
        const {comment, audioFilePath, attachImage, videoFilePath, isAttaching} = this.state
        const {userInfo} = this.props
        if(attachImage.uri === 'none' && audioFilePath.length == 0 && comment.replace(/ /g, '').length === 0) return
        else if(isAttaching) return

        const TS = new Date().getTime()
        const location = {
            latitude: this.props.myLocation.coords.latitude,
            longitude: this.props.myLocation.coords.longitude,
        }
        
        this.setState({isAttaching: true})
        if(videoFilePath.length > 0){
            let filename = Service.generateKey(userInfo.uid) + '.mov';
            console.log('Video Path: ', videoFilePath)
            Service.uploadVideoFile(TS, userInfo, videoFilePath, filename, comment, location, () => {
                this.setState({isAttaching: false})
            })
        }
        else if(audioFilePath.length == 0){            
            let filename = userInfo.uid + TS;
            Service.postTextAndImage(TS, attachImage.uri, filename, userInfo, comment, location, (res) => {
                this.setState({isAttaching: false})
                if(res == 'success'){
                    //scroll to top
                    this.initAttachFiles()
                }                
            })
        }
        else{
            let filename = Service.generateKey(userInfo.uid) + '.aac';
            Service.uploadAudioFile(TS, userInfo, audioFilePath, filename, location, () => {
                this.setState({isAttaching: false})
                //scroll to top
                this.initAttachFiles()
            })
            // let newPath = Platform.OS === 'android' ? RNFetchBlob.fs.dirs.MusicDir + '/Nebzy/audio/' : RNFetchBlob.fs.dirs.DocumentDir + '/Nebzy/audio/';;
            // RNFetchBlob.fs.cp(audioFilePath, newPath)
            // .then(() => {
            //     Service.uploadAudioFile(TS, userInfo, newPath, filename, location, () => {
            //         this.setState({isAttaching: false})
            //         //scroll to top
            //         this.initAttachFiles()
            //     })
            // }).catch((error) => { console.log('mv error: ' + error); })
        }
    }

    initAttachFiles() {
        this.setState({attachImage: {uri: 'none'}, comment: '', audioFilePath: '', recording: false})
    }

    onCancelAttachImage() {
        this.setState({attachImage: {uri: 'none'}})
    }

    onCancelAttachVideo() {
        this.setState({videoFilePath: ''})
    }

    onStopRecord() {
        if(this.state.recording) {
            this._stop()
        }
    }

    onCancelRecord() {
        this.setState({recording: false, audioFilePath: ''})
    }

    convertToCallTime(T) {
        const H = Math.floor(T / 3600);
        const M = Math.floor(T / 60);
        const S = T % 60;
        return `${(H > 0 ? (`${H}:`) : '') + (M < 10 ? '0' : Math.floor(M / 10)) + (M % 10)}:${S < 10 ? '0' : Math.floor(S / 10)}${S % 10}`;
    }

    onChangeViewableItems(Info) {
        let keyStr = ''
        Info.viewableItems.map(function(item) {
            keyStr = keyStr + item.key
        })
        this.setState({keyStr})
    }

    render(){
        const {walls, isLoading, attachImage, isAttaching, currentTime, audioFilePath, videoFilePath, recording, comment} = this.state
        return(
            <View style={styles.container}>
                <CustomHeader
                    badge={true}
                    left='ios-arrow-back'
                    title='🌴🏢🏟🛣🛳🏨🌳'
                    right='ios-text-outline'
                    onPressRight={() => this.props.onPressBubble()}
                    onPressLeft={() => this.props.onPressBack()}
                />
                <KeyboardAwareView animated={true} style={{flex: 1}}>
                    <View style={{flex: 1, position: 'relative'}}>
                    {
                        isLoading?
                        <View style={styles.emptyView}>
                            <WaveIndicator color={Color.green} size={80}/>
                        </View>
                        :
                        Object.keys(walls).length == 0 ?
                        <View style={styles.emptyView}>
                            <Text style={styles.TimeText}>Post something</Text>
                        </View>
                        :
                        <FlatList 
                            ref={(ref) => this.listview = ref}
                            contentContainerStyle={{paddingVertical: 5}}
                            style={{flex: 1}}
                            data={walls}
                            renderItem={this.renderWallRow.bind(this)}
                            enableEmptySections={true}
                            onViewableItemsChanged={(info) => this.onChangeViewableItems(info)}
                        />          
                    }
                    </View>
                    <View style={styles.attachView}>
                        <View style={styles.stateView}>
                            {
                                isAttaching ?
                                <View style={{alignItems: 'center', height: 50}}>
                                    <WaveIndicator color={Color.green} size={40}/>
                                </View>
                                :attachImage.uri !== 'none' ?
                                <View style={styles.imagePreview}>
                                    <Image source={attachImage} style={styles.attachImage} />
                                    <Text style={styles.attachText}>Image Attached</Text>
                                    <TouchableOpacity onPress={this.onCancelAttachImage.bind(this)}>
                                        <Icon name='md-close' style={{margin: 5}} size={30} color={Color.text} />
                                    </TouchableOpacity>
                                </View>
                                :recording || audioFilePath.length > 0 ?
                                <View style={styles.imagePreview}>
                                    <Text style={styles.attachText}>{audioFilePath.length > 0 ? 'Audio Recorded' : 'Recording...'} {Service.convertDuringTime(currentTime)}</Text>
                                    {
                                        audioFilePath.length == 0 ?
                                        <TouchableOpacity onPress={this.onStopRecord.bind(this)} style={styles.audioStopIconView}>
                                            <Icon name='md-square' style={{margin: 5}} size={10} color={Color.text} />
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={this.onCancelRecord.bind(this)}>
                                            <Icon name='md-close' style={{margin: 5}} size={30} color={Color.text} />
                                        </TouchableOpacity>
                                    }                                  
                                </View>
                                :videoFilePath.length > 0 ?
                                <View style={styles.imagePreview}>
                                    <Text style={styles.attachText}>Video Attached</Text>
                                    <TouchableOpacity onPress={this.onCancelAttachVideo.bind(this)}>
                                        <Icon name='md-close' style={{margin: 5}} size={30} color={Color.text} />
                                    </TouchableOpacity>
                                </View>
                                :null
                            }
                        </View>
                        <View style={styles.inputView}>      
                            <TouchableOpacity onPress={this.onAddImage.bind(this)}>
                                <Icon name='ios-camera-outline' style={{marginRight: 10}} size={24} color={Color.blue} />
                            </TouchableOpacity>
                            {
                                Platform.OS === 'android' && 
                                <TouchableOpacity onPress={this.onRecordAudio.bind(this)}>
                                    <Icon name='ios-mic-outline' style={{marginRight: 10}} size={24} color={Color.blue} />
                                </TouchableOpacity>  
                            }                            
                            {/* { 
                                <TouchableOpacity onPress={this.onRecordVideo.bind(this)}>
                                    <Icon name='md-videocam' style={{marginRight: 10}} size={24} color={Color.blue} />
                                </TouchableOpacity>
                            } */}
                            <View style={styles.inputContainer}>
                                <TextInput 
                                    style={styles.inputMessage}
                                    placeholder='add emoji ✍🏼'
                                    placeholderTextColor={Color.gray}
                                    value={comment}
                                    onChangeText={(text) => this.setState({comment: text})}
                                    underlineColorAndroid='transparent'
                                />
                            </View>                            
                            {
                                attachImage.uri !== 'none' || comment.length > 0 || audioFilePath.length > 0?
                                <TouchableOpacity onPress={() => this.onSendWall()}>
                                    <Icon name='md-send' style={{marginLeft: 10}} size={24} color={Color.blue} />
                                </TouchableOpacity>
                                :null
                            }                            
                        </View>
                    </View>   
                </KeyboardAwareView>
            </View>        
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.white,
    },    
    wallView: {
        alignItems: 'center',
        padding: 10,
        position: 'relative'
    },
    loadingView: { 
        position: 'absolute', 
        zIndex: 10, 
        top: 0, 
        left: 0, 
        right: 0, 
        flexDirection: 'row',
        justifyContent: 'center', 
        alignItems: 'center'
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
        position: 'relative',
        backgroundColor: 'transparent',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Color.blue,
        width: Width - 20,
        marginTop: 4,
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
    commentView: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        minWidth: 20,
        height: 20,
        padding: 6,
        backgroundColor: Color.darkgreen,
        borderRadius: 10,
        alignItems: 'center',        
        justifyContent: 'center',
    },
    commentText: {
        color: Color.white,
        fontSize: 15,
    },
    actionView: {
        paddingHorizontal: 10,
        width: Width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
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
    inputView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        ...ifIphoneX({
            height: 80,
            paddingBottom: 30
        }, {
            height: 50,            
        })
    },
    inputContainer: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        paddingHorizontal: 10,
        borderRadius: 6,
        borderColor: Color.gray,
        borderWidth: 1
    },
    attachView: {
        backgroundColor: Color.lightgray,
        borderTopWidth: 1,
        borderColor: Color.blue,
        zIndex: 999
    },
    imagePreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        alignItems: 'center'
    },
    attachImage: {
        width: 80,
        height: 80,
        resizeMode: 'cover'
    },
    attachText: {
        fontSize: 18,
        color: Color.text
    },
    audioStopIconView: {
        width: 30, 
        height: 30, 
        borderRadius: 30, 
        borderWidth: 1, 
        borderColor: Color.text,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
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
    comment_count: state.comment_count   
  }
}, mapDispatchToProps)(Wall);
