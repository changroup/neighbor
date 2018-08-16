'use strict';

/*jshint esversion: 6*//*jshint node: true*/
import React, {Component} from 'react'
import {
    View, 
    StyleSheet, 
    RefreshControl, 
    Dimensions, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ScrollView,
    AppState,
    Platform,
    PermissionsAndroid
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import Color from '../../lib/color.js'
import { Container } from 'native-base'
import Icon from 'react-native-vector-icons/Ionicons';
import {AudioRecorder, AudioUtils, AudioPlayer} from 'react-native-audio';
import CustomHeader from '../../component/header'
import { KeyboardAwareView } from 'react-native-keyboard-aware-view'
import Message from './message'
import * as Service from '../../lib/service'
import { WaveIndicator } from 'react-native-indicators';
import firebase from '../../lib/firebase'
import { ifIphoneX } from 'react-native-iphone-x-helper'

var ImagePicker = require('react-native-image-picker');

const Height = Dimensions.get('window').height
const Width = Dimensions.get('window').width

export class ChatView extends Component{

    constructor(props){
        super(props);
        this.state = {
            userId: this.props.navigation.state.params.userId,
            roomID: this.props.navigation.state.params.roomID,
            limit: 20,
            messages: {},
            refreshing: false,
            dateJSON: {},
            msg: '',
            isLoading: true,
            isUploading: false,
            uploadingState: '0',
            appState: AppState.currentState,
            sending: false,
            audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
            audioFilePath: '',
            recording: false,
            hasPermission: undefined,
            stoppedRecording: false,
            currentTime: 0,
            isAttaching: false
        };
    };

    componentDidMount() {
        this.mounted = true
        const {roomID, limit} = this.state
        this.fetchMessages(roomID, limit)    
        AppState.addEventListener('change', this._handleAppStateChange); 
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

    componentWillUnmount() {
        this.mounted = false
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            //going to foreground
            this.mounted && this.scrollToEnd()
            this.mounted && Service.removeBadgeForUser(this.state.userId, this.props.userInfo)
        }
        else{
            //going to background
        }
        this.setState({appState: nextAppState});
    }

    fetchMessages(roomID, limit){
        this.props.fetchMessages(roomID, limit, (messages) => {
            this.mounted && this.setState({messages, isLoading: false})
            this.mounted && this.scrollToEnd()
        })
    }

    scrollToEnd() {
        const _this = this
        setTimeout(() => {
            _this.scrollView && _this.scrollView.scrollToEnd({animated: true})
        }, 500)
    }

    onAttach() {
        var options = {
            title: 'Select Image',
            storageOptions: {
              skipBackup: true,
              path: 'images'
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
                this.sendImage(response.uri)
            }
        });
    }

    sendImage(filePath) {
        const {msg, roomID, userId} = this.state
        const {userInfo} = this.props
        const TS = new Date().getTime()
        const key = userInfo.uid + TS
        Service.getUserData(userId, (userData) => {
            if(userData.blockUsers == undefined || userData.blockUsers.indexOf(this.props.userInfo.uid) < 0){
                this.setState({isUploading: true})
                firebase.storage()
                .ref('/image/' + key)
                .putFile(filePath, {
                    contentType: 'image/jpeg'
                })
                .on('state_changed', snapshot => {
                    //Current upload state
                    if(this.mounted){
                        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        this.setState({uploadingState: Math.floor(progress)})
                    }
                    
                }, err => {
                    //Error
                    alert('Error occured while uploading')
                }, uploadedFile => {
                    //Success                    
                    Service.addSmallSizeImage(roomID, key, filePath, TS, userInfo, userId, () => {
                        if(this.mounted) this.setState({isUploading: false})
                    })       
                });
            }
            else {
                alert('You can no longer chat with this person')
            }
        })
    }

    onSendMessage() {
        const {msg, roomID, userId, sending, audioFilePath, isAttaching} = this.state
        const { userInfo } = this.props
        if(isAttaching) return    
        if(audioFilePath.length == 0){
            if(msg.replace(/ /g, '').length == 0 || sending) return
            this.setState({sending: true})
            Service.getUserData(userId, (userData) => {
                this.setState({sending: false})
                if(userData.blockUsers == undefined || userData.blockUsers.indexOf(userInfo.uid) < 0){
                    this.props.sendMessage(msg, roomID, userId, userInfo)
                    this.setState({msg: ''})
                    this.scrollToEnd()
                }
                else{
                    alert('You can no longer chat with this person')
                }
            })
        } else {
            this.setState({isAttaching: true})
            let filename = Service.generateKey(userInfo.uid) + '.aac';
            Service.sendAudioFile(userId, roomID, userInfo, audioFilePath, filename, () => {
                this.setState({isAttaching: false})
                //scroll to top
                this.initAttachFiles()
            })
        }
    }

    initAttachFiles() {
        this.setState({ audioFilePath: '', recording: false })
    }

    _onRefresh() {
        const {roomID, limit} = this.state
        this.setState({refreshing: true});
        this.props.fetchMessages(roomID, limit + 20, (messages) => {
            this.setState({messages, limit: limit + 20, refreshing: false})
        })
    }

    onFocusInput() {
        this.scrollToEnd()        
    }

    getDate(TS) {
        const DT = new Date(TS)
        const Y = DT.getFullYear()
        const m = DT.getMonth()
        const D = DT.getDate()
        const dateStr = Y + m + D
        return dateStr
    }

    onPressImage(url) {
        if(url == '' || url === undefined) return
        this.props.setPreviewImage(url)
        this.props.navigation.navigate('preview', {imageURL: url})
    }

    renderMessageRow(Item, rowId) {
        if(Item.audio !== undefined && Item.audio.length > 10 && Platform.OS === 'ios') return null
        const DD = this.getDate(Item.timestamp)
        const key = rowId
        if(this.previousDD == DD){
            return(
                <Message key={key} data={Item} onPressImage={(url) => this.onPressImage(url)} />
            )
        }
        else{
            this.previousDD = DD
            return(
                <View key={key}>
                    <View style={styles.dateView}>
                        <View style={styles.line}/>
                        <Text style={styles.dateText}>{Service.convertToYMDTime(Item.timestamp)}</Text>
                        <View style={styles.line}/>
                    </View>
                    <Message key={key} data={Item} onPressImage={(url) => this.onPressImage(url)} />
                </View>
            )
        }            
    }

    prepareRecordingPath(audioPath){
        AudioRecorder.prepareRecordingAtPath(audioPath, {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "Low",
            AudioEncoding: "aac",
            AudioEncodingBitRate: 32000,
            MeteringEnabled: true
        });
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

    onRecordAudio() {
        this.setState({recording: true, audioFilePath: '', stoppedRecording: false})
        this._record()
    }

    _finishRecording(didSucceed, filePath) {
        this.setState({ finished: didSucceed });
        console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath}`);
        this.setState({audioFilePath: filePath, recording: false})
    }

    async _stop() {
        if (!this.state.recording) {
            console.warn('Can\'t stop, not recording!');
            return;
        }
  
        this.setState({stoppedRecording: true});
  
        try {
            const filePath = await AudioRecorder.stopRecording();
    
            if (Platform.OS === 'android') {
                this._finishRecording(true, filePath);
            }
            return filePath;
        } catch (error) {
            console.error(error);
        }
    }

    onStopRecord() {
        if(this.state.recording) {
            this._stop()
        }
    }

    onCancelRecord() {
        this.setState({recording: false, audioFilePath: ''})
    }

    render(){
        const _this = this
        const { messages, isLoading, isUploading, recording, audioFilePath, currentTime, isAttaching } = this.state
        _this.previousDD = ''

        return(
            <Container style={{backgroundColor: Color.white}}>
                <CustomHeader
                    left='ios-arrow-back'
                    title='🌴🏢🏟🛣🛳🏨🌳'
                    onPressLeft={() => this.props.navigation.goBack()}
                />                
                <KeyboardAwareView animated={true} style={{flex: 1}}>
                    <View style={styles.scrollInnerView}>
                    {
                        isLoading ?
                        <View style={styles.loadingView}>
                            <WaveIndicator color={Color.green} size={80}/>
                        </View>
                        :Object.keys(messages).length == 0?
                        <View style={styles.emptyView}>
                            <Text style={styles.emptyText}>No messages</Text>
                        </View>
                        :
                        <ScrollView
                            style={{flex: 1}}
                            contentContainerStyle={{paddingHorizontal: 10}}
                            ref={(ref) => this.scrollView = ref}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={() => this._onRefresh()}
                                />
                            }
                        >
                        {
                            messages.map(function(msg, index) {
                                return _this.renderMessageRow(msg, index)
                            })
                        }
                        </ScrollView>
                    }
                    </View>
                    {
                        isUploading?
                        <View style={styles.uploadView}>
                            <Text style={styles.uploadText}>{this.state.uploadingState + '% uploaded'}</Text>
                        </View>
                        :null
                    }
                    {
                        isAttaching ?
                        <View style={{alignItems: 'center', height: 50}}>
                            <WaveIndicator color={Color.green} size={40}/>
                        </View>
                        : recording || audioFilePath.length > 0 ?
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
                        : null
                    }
                    <View style={styles.inputView}>
                        <TouchableOpacity onPress={() => this.onAttach()}>
                            <Icon name='md-attach' style={{marginRight: 10}} size={24} color={Color.gray} />
                        </TouchableOpacity>  
                        {
                            Platform.OS === 'android' &&
                            <TouchableOpacity onPress={this.onRecordAudio.bind(this)}>
                                <Icon name='ios-mic-outline' style={{marginRight: 10}} size={24} color={Color.gray} />
                            </TouchableOpacity> 
                        }                        
                        <View style={styles.textView}>
                            <TextInput
                                style = {styles.textInput}
                                placeholder = "New Message"
                                placeholderTextColor = {Color.gray}
                                underlineColorAndroid='transparent'
                                autoCapitalize = 'sentences'
                                onChangeText = {(text) => this.setState({ msg: text })}
                                value = {this.state.msg}
                                onFocus={() => this.onFocusInput()}
                            />
                        </View>
                        <TouchableOpacity onPress={() => this.onSendMessage()}>
                            <Text style={styles.sendText}>Send</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareView>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    scrollInnerView: {
        flex: 1,
        backgroundColor: Color.white,
        paddingBottom: 10,
    },
    loadingView: {
        height: Height - 80,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputView: {
        
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 15,
        backgroundColor: Color.lightgray,
        borderTopWidth: 1,
        borderColor: Color.gray,
        ...ifIphoneX({
            height: 80,
            paddingBottom: 30
        }, {
            height: 50,            
        })
    },
    attachIcon: {
        width: 25,
        height: 32,
        resizeMode: 'stretch'
    },
    textView: {
        flex: 1,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Color.gray,
        marginRight: 10,
    },
    sendText: {
        backgroundColor: 'transparent',
        color: Color.gray
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 10
    },
    emptyView: {
        height: Height - 100,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        textAlign: 'center',
        color: Color.text
    },
    dateView: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center'
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: Color.gray
    },
    dateText: {
        width: 120,
        padding: 15,
        color: Color.gray,
        fontSize: 10
    },
    uploadView: {
        height: 50,
        marginHorizontal: Width * 0.15,
        marginVertical: 20,
        backgroundColor: '#000000AA',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    },
    uploadText: {
        fontSize: 18,
        color: Color.white,
        backgroundColor: 'transparent'
    },
    imagePreview: {
        borderTopWidth: 1,
        borderColor: Color.gray,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        alignItems: 'center'
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
  }
}, mapDispatchToProps)(ChatView);
