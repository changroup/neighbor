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
    ScrollView,
    AppState,
    ListView
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import Color from '../../lib/color.js'
import { Container } from 'native-base'
import CustomHeader from '../../component/header'
import { KeyboardAwareView } from 'react-native-keyboard-aware-view'
import Comment from './comment'
import * as Service from '../../lib/service'
import { ifIphoneX } from 'react-native-iphone-x-helper'

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const Height = Dimensions.get('window').height
const Width = Dimensions.get('window').width

export class CommentRoom extends Component{

    constructor(props){
        super(props);
        this.state = {
            wallID: this.props.navigation.state.params.wallID,
            msg: ''
        };
    };

    componentDidMount() {
        this.mounted = true
        this.props.fetchComments(this.state.wallID)    
        AppState.addEventListener('change', this._handleAppStateChange);    
    }

    componentWillUnmount() {
        this.mounted = false
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            //going to foreground
            this.mounted && this.scrollToEnd()
        }
        else{
            //going to background
        }
        this.setState({appState: nextAppState});
    }

    scrollToEnd() {
        const _this = this
        setTimeout(() => {
            _this.scrollView && _this.scrollView.scrollToEnd({animated: true})
        }, 500)
    }

    onSendComment() {
        const {msg, wallID} = this.state
        if(msg.replace(/ /g, '').length == 0) return
        const key=this.props.userInfo.uid + 
        Service.sendComment(this.props.userInfo, msg, wallID)
        this.scrollToEnd()
        this.setState({msg: ''})
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

    renderMessageRow(Item, rowId) {
        const DD = this.getDate(Item.timestamp)
        const key = rowId
        if(this.previousDD == DD){
            return(
                <Comment key={key} data={Item} />
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
                    <Comment key={key} data={Item} />
                </View>
            )
        }            
    }

    render(){
        const _this = this
        const {comments} = this.props
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
                            Object.keys(comments).length == 0?
                            <View style={styles.emptyView}>
                                <Text style={styles.emptyText}>No comments</Text>
                            </View>
                            :
                            <ScrollView
                                style={{flex: 1, paddingHorizontal: 10}}
                                ref={(ref) => this.scrollView = ref}
                            >
                            {
                                comments.map(function(msg, index) {
                                    return _this.renderMessageRow(msg, index)
                                })
                            }
                            </ScrollView>
                        }
                        </View>
                        <View style={styles.inputView}>
                            <View style={styles.textView}>
                                <TextInput
                                    style = {styles.textInput}
                                    placeholder = "New Comment"
                                    placeholderTextColor = {Color.gray}
                                    underlineColorAndroid='transparent'
                                    autoCapitalize = 'sentences'
                                    onChangeText = {(text) => this.setState({ msg: text })}
                                    value = {this.state.msg}
                                    onFocus={() => this.onFocusInput()}
                                />
                            </View>
                            <TouchableOpacity onPress={() => this.onSendComment()}>
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
        padding: 5,
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
        height: 32
    },
    textView: {
        flex: 1,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Color.gray,
        marginHorizontal: 10,
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
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    appState: state.appState,
    userInfo: state.userInfo,
    myLocation: state.myLocation,
    comments: state.comments
  }
}, mapDispatchToProps)(CommentRoom);
