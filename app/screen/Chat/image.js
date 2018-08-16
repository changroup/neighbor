import React, {Component, PropTypes} from 'react'
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
import Image from 'react-native-image-progress';
import ProgressBar from 'react-native-progress/Circle';
import * as Service from '../../lib/service'

const Width = Dimensions.get('window').width

class ImageMessage extends Component{
    constructor(props){
        super(props);
        this.state = {
            imageURL: ''
        };
    }

    static propTypes = {
        data: PropTypes.object.isRequired,
        time: PropTypes.number.isRequired,
        onPressImage: PropTypes.func.isRequired,
        direction: PropTypes.string.isRequired//bubble direction
    }

    static defaultProps = {
        onPressImage: () => undefined
    }

    componentDidMount() {
        //alert(JSON.stringify(this.props.data))
        Service.getImageWithURL(this.props.data.small, (url) => {
            this.setState({imageURL: url})
        })
    }

    render() {
        const {imageURL} = this.state
        const { direction, data } = this.props
        return(
            <View style={{flex: 1}}>
            <View style={direction == 'right' ? styles.rightContainer : styles.leftContainer}>
            {
                imageURL == '' ? null :
                <TouchableOpacity 
                    style={direction == 'right' ? styles.rightImageView: styles.leftImageView} 
                    onPress={() => this.props.onPressImage(data.image)}
                >
                    <Image 
                        source={{uri: imageURL}} 
                        style={{flex: 1}} 
                        indicator={ProgressBar} 
                    />
                </TouchableOpacity>
            }
            </View>
            <Text style={[styles.TimeText, {textAlign: direction}]}>{Service.convertToDayTime(this.props.time)}</Text>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    rightContainer: {
        flex: 1,
        height: Width * 0.5,
        marginRight: 10,
        borderRadius: 10,
        borderTopRightRadius: 0,
        backgroundColor: Color.gray
    },
    leftContainer: {
        flex: 1,
        height: Width * 0.5,
        marginLeft: 10,
        borderRadius: 10,
        borderTopLeftRadius: 0,
        backgroundColor: Color.darkgreen
    },
    rightImageView: {
        flex: 1,
        borderRadius: 10,
        borderTopRightRadius: 0,
        overflow: 'hidden'
    },
    leftImageView: {
        flex: 1,
        borderRadius: 10,
        borderTopLeftRadius: 0,
        overflow: 'hidden'
    },
    TimeText: {
        paddingTop: 5,
        color: Color.darkgray,
        fontSize: 10,
        paddingHorizontal: 10
    }
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    userInfo: state.userInfo,
  }
}, mapDispatchToProps)(ImageMessage);