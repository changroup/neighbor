import React, { Component } from 'react'
import {
    View, 
    StyleSheet, 
    Dimensions, 
    Text, 
    TouchableOpacity, 
} from 'react-native'
import Color from '../../lib/color.js'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import Icon from 'react-native-vector-icons/Ionicons';

const Width = Dimensions.get('window').width

class VideoRecord extends Component{
    constructor(props){
        super(props);
        this.state = {
            recording: false
        };
    }

    static propTypes = {
    }

    static defaultProps = {

    }

    componentDidMount() {

    }

    render() {
        return(
            <View style={{flex: 1}}>
                <Camera
                    ref={(cam) => this.camera = cam}
                    aspect={Camera.constants.Aspect.fill}
                    style={styles.preview}
                >
                {
                    this.state.recording?
                    <TouchableOpacity style={styles.capture} onPress={this.stopRecording.bind(this)}>
                        <Icon name='ios-square' size={40} color='red'/>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity style={styles.capture} onPress={this.startRecording.bind(this)}>
                        <Icon name='md-camera' size={40} color={Color.darkgray}/>
                    </TouchableOpacity>
                }
                    
                </Camera>
                {
                    this.state.recording?null
                    :
                    <Text style={styles.notifyText}>
                        This recording will be terminated after 9 seconds. Please click camera icon to start recording.
                    </Text>  
                }
                <TouchableOpacity style={styles.backButton} onPress={() => this.props.navigation.goBack()}>
                    <Icon name='md-close' size={40} color={Color.white} style={{margin: 0, padding: 0}}/>
                </TouchableOpacity>
            </View>
        )
    }

    startRecording() {
        const options = {
            mode: Camera.constants.CaptureMode.video,
            target: Camera.constants.CaptureTarget.cameraRoll,
            totalSeconds: 9
        };
        this.setState({recording: true})
        //options.location = ...
        this.camera.capture(options)
        .then((data) => {
            console.log('cameraCapture', data)
            this.props.navigation.state.params.onRecorded(data)
            this.props.navigation.goBack()  
        })
        .catch(err => console.log('cameraCapture', err));
    }

    stopRecording() {
        this.camera.stopCapture()
        this.setState({recording: false})
    }

}

const styles = StyleSheet.create({
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    capture: {
        margin: 40,
        width: Width * 0.2,
        height: Width * 0.2,
        borderRadius: Width * 0.2,
        backgroundColor: '#FFFFFFBB',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    notifyText: {
        position: 'absolute',
        top: 120,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFFBB',
        color: Color.blue,
        padding: 15,
        fontSize: 18
    },
    backButton: {
        position: 'absolute',        
        right: 20,
        top: 50,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000BB',
    },
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    userInfo: state.userInfo,
    myLocation: state.myLocation
  }
}, mapDispatchToProps)(VideoRecord);