import React, { Component } from 'react'
import {
    View, 
    StyleSheet, 
    TouchableOpacity, 
} from 'react-native'
import Color from '../../lib/color.js'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import * as Service from '../../lib/service'
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import { SkypeIndicator } from 'react-native-indicators';
import { AudioUtils } from 'react-native-audio';


class VideoPreview extends Component{
    constructor(props){
        super(props);
        this.state = {
            data: this.props.navigation.state.params.data,
            videoURL: '',
            videoPath: AudioUtils.DocumentDirectoryPath + '/test.mov',
            downloaded: false
        };
    }

    componentDidMount() {
        const url = Service.getFirebaseVideoURL(this.state.data.videoURL, this.state.videoPath, (result) => {
            this.setState({downloaded: true})
        })  
    }

    static propTypes = {
    }

    static defaultProps = {

    }

    render() {
        return(
            <View style={{flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center'}}>
                {
                    this.state.downloaded?
                    <Video
                        source={{uri: this.state.videoPath}}
                        style={styles.fullScreen}
                        rate={1}
                        volume={1}
                        muted={false}
                        resizeMode='contain'
                        onEnd={() => {
                            alert('Finished')
                            this.props.navigation.goBack()
                        }}
                        repeat={false}
                    />
                    :
                    <SkypeIndicator color={Color.white} size={80}/>
                }
                <TouchableOpacity style={styles.backButton} onPress={() => this.props.navigation.goBack()}>
                    <Icon name='md-close' size={40} color={Color.white} style={{margin: 0, padding: 0}}/>
                </TouchableOpacity>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    fullScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
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
}, mapDispatchToProps)(VideoPreview);