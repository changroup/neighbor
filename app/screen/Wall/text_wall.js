import React, {Component, PropTypes} from 'react'
import {
    View, 
    StyleSheet, 
    Dimensions, 
    Text, 
    TouchableOpacity, 
} from 'react-native'
import Color from '../../lib/color.js'
import * as Service from '../../lib/service'
import Image from 'react-native-image-progress';
import ProgressBar from 'react-native-progress/Circle';

const Width = Dimensions.get('window').width
const ImageHeight = Width * 0.5

export default class TextWall extends Component{
    constructor(props){
        super(props);
        this.state = {
            imageURL: '',
            url: ''
        };
    }

    componentDidMount() {
        this.getImageWithURL(this.props.wallData.small)
    }

    static propTypes = {
        wallData: PropTypes.object.isRequired,
        handle: PropTypes.object.isRequired,
        keyStr: PropTypes.string.isRequired,
        onLongPressImage: PropTypes.func
    }

    static defaultProps = { 
        onPressImage: () => undefined
    }

    getImageWithURL(url) {
        const { wallData, keyStr } = this.props
        if(url == 'none') return        
        console.log('imageURL ', url )
        keyStr.indexOf(wallData.key) < 0 || Service.getImageWithURL(url, (imageURL) => {
            this.setState({imageURL, url})
        })
    }

    onPressImage() {
        if(this.props.wallData.image == '') return
        this.props.handle.setPreviewImage(this.props.wallData.image)
        this.props.handle.navigation.navigate('preview', {imageURL: this.props.wallData.image})
    }

    render() {
        const { wallData, keyStr } = this.props
        if(this.state.url != wallData.small) this.getImageWithURL(wallData.small)
        return(
            <View>                
                {
                    (wallData.small !== 'none' && wallData.small !== undefined) &&
                    <TouchableOpacity delayLongPress={1000} onPress={() => this.onPressImage()} onLongPress={() => this.props.onLongPressImage()} style={styles.imageView}>
                        {
                            keyStr.indexOf(wallData.key) < 0 ? 
                            <View style={styles.image} />
                            :<Image 
                                source={{uri: this.state.imageURL}} 
                                indicator={ProgressBar} 
                                style={styles.image} 
                                imageStyle={{borderRadius: 5}} 
                            />
                        }
                    </TouchableOpacity>
                }
                { wallData.text.length > 0 && <Text style={styles.MsgText}>{wallData.text}</Text> }                   
            </View>
        )
    }

}

const styles = StyleSheet.create({
    MsgText: {
        color: Color.text,
        fontSize: 16,
        lineHeight: 20,
        padding: 15,
        fontFamily: 'Roboto',
        //fontWeight: 'bold'
    },
    image: {
        backgroundColor: Color.blue,
        overflow: 'hidden',
        width: Width - 22,
        height: ImageHeight,
        overflow: 'hidden'
    },
    imageView: {
        alignItems: 'center',
        overflow: 'hidden'
    }
})