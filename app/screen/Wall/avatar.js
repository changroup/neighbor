import React, {Component, PropTypes} from 'react'
import {
    View, 
    StyleSheet, 
    Dimensions, 
    Animated,
    Easing,
} from 'react-native'
import Color from '../../lib/color.js'
import * as Service from '../../lib/service'
import Avatar from '../../component/avatar'
import DoubleClickView from '../../component/doubleClick'

const maxHeartWidth = 9

export default class WallAvatar extends Component{
    constructor(props){
        super(props);
        this.state = {
            heartWidth: new Animated.Value(0),
            heartHeight: new Animated.Value(0),
        };
    }

    static propTypes = {
        wall: PropTypes.object.isRequired,
        myLocation: PropTypes.object.isRequired,
        me: PropTypes.object.isRequired,
        onClickUser: PropTypes.func.isRequired
    }

    static defaultProps = {

    }

    componentDidMount() {
        this.mounted = true
    }

    componentWillUnmount() {
        this.mounted = false
    }

    onLike() {        
        this.state.heartWidth.setValue(0)
        this.state.heartHeight.setValue(0)
        this.widthAnimation && this.widthAnimation.stop()
        this.heightAnimation && this.heightAnimation.stop()
        setTimeout(() => {
            this.widthAnimation = Animated.timing(
                this.state.heartWidth,
                {
                    toValue: maxHeartWidth,
                    easing: Easing.elastic(1.25),
                    duration: 1000
                }
            ).start();
        }, 300)
        setTimeout(() => {
            this.heightAnimation = Animated.timing(
                this.state.heartHeight,
                {
                    toValue: maxHeartWidth * 0.8,
                    easing: Easing.elastic(1.25),
                    duration: 1000
                }
            ).start();
        }, 300)
        Service.likeUser(this.props.wall.uid, this.props.me)
    }

    onClickUser() {
        this.props.onClickUser()
    }

    render() {
        const {wall} = this.props
        const {heartWidth, heartHeight} = this.state
        return(
            <View style={styles.container}>
                <View style={{position: 'relative', paddingHorizontal: 10}}>
                    <View style={styles.avatarView}>
                        <DoubleClickView
                            style={{backgroundColor: 'red'}}
                            onDoubleClick={() => this.onLike()}
                            onClick={() => this.onClickUser(wall.uid)}
                        >
                            <View>
                                <Avatar width={50} userId={wall.uid}/>
                            </View>
                        </DoubleClickView>                        
                    </View>
                    <View style={{
                        width: maxHeartWidth * 1.5, 
                        height: maxHeartWidth, 
                        position: 'absolute', 
                        backgroundColor: 'transparent', 
                        top: 0, 
                        right: 0, 
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Animated.Image 
                            source={require('../../resource/image/green_heart.png')} 
                            style={{
                                width: heartWidth, 
                                height: heartHeight,
                                resizeMode: 'stretch'
                            }} 
                        />
                    </View>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center'
    },
    avatar: {
        width: 44,
        height: 44,        
    },
    avatarView: {
        padding: 1,        
        borderWidth: 2,
        borderColor: Color.blue,
        borderRadius: 100,
        overflow: 'visible'
    },
    awayText: {
        color: Color.text, 
        fontSize: 12,
        lineHeight: 12,
    }

})