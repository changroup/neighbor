import React, { Component } from 'react'
import {
    View, 
    StyleSheet, 
    Dimensions, 
    TouchableOpacity, 
} from 'react-native'
import Color from '../../lib/color.js'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import * as Service from '../../lib/service'
import PhotoView from 'react-native-photo-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { SkypeIndicator } from 'react-native-indicators';
import { ifIphoneX } from 'react-native-iphone-x-helper'

const Height = Dimensions.get('window').height
const Width = Dimensions.get('window').width

class PreviewImage extends Component{
    constructor(props){
        super(props);
        this.state = {
            imageURL: '',
            isLoading: false
        };
    }

    componentDidMount() {
        //alert(this.props.previewImage)
        this.getImageWithURL(this.props.previewImage)
    }

    getImageWithURL(url) {
        if(url == 'none') return        
        Service.getImageWithURL(url, (imageURL) => {
            this.setState({imageURL, url})
        })
    }

    render() {
        return(
            <View style={{flex: 1, backgroundColor: 'black'}}>
                <PhotoView
                    source={{uri: this.state.imageURL}}
                    minimumZoomScale={1}
                    maximumZoomScale={3}
                    androidScaleType="centerInside"
                    onLoadStart={() => this.setState({isLoading: true})}
                    onLoadEnd={() => this.setState({isLoading: false})}
                    onLoad={() => console.log("Image loaded!")}
                    style={{width: Width, height: Height, backgroundColor: 'black'}} 
                />
                <TouchableOpacity style={styles.backButton} onPress={() => this.props.navigation.goBack()}>
                    <Icon name='md-close' size={40} color={Color.white} style={{margin: 0, padding: 0}}/>
                </TouchableOpacity>
                {
                    this.state.isLoading?
                    <View style={styles.loadingView}>
                        <SkypeIndicator color={Color.white} size={80}/>
                    </View>
                    :null
                }
            </View>
        )
    }

}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',        
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000BB',
        ...ifIphoneX({
            top: 50,
        }, {
            top: 20,
        })
    },
    loadingView: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    userInfo: state.userInfo,
    previewImage: state.previewImage
  }
}, mapDispatchToProps)(PreviewImage);