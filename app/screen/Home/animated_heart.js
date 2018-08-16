import React, {Component, PropTypes} from 'react'

import {
    Dimensions, 
    StyleSheet,
    Animated,
    View,
    Image
} from 'react-native'
import Color from '../../lib/color.js'

const Width = Dimensions.get('window').width
const maxWidth = Width * 0.32
var ANIMATION_END_Y = Math.ceil(maxWidth * .5);
var NEGATIVE_END_Y = ANIMATION_END_Y * -1;

var Heart = React.createClass({
    render: function() {
        return (
            <View style={[styles.heart, this.props.style]}>
                <Image 
                    source={require('../../resource/image/green_heart.png')} 
                    style={{
                        width: 10, 
                        height: 10,
                        resizeMode: 'stretch'
                    }} 
                />
            </View>
        )
    }
});

export default class AnimatedHeart extends Component {
    constructor(props){
        super(props);
        this.state = {
            position: new Animated.Value(0)
        };
    }
    
    static propTypes = {
        onComplete: PropTypes.func.isRequired,
        right: PropTypes.number.isRequired,
        start: PropTypes.number.isRequired
    }

    static defaultProps = {
        start: 0
    }
    
    componentWillMount() {
        this.mounted = true
        this.init()
    }

    componentWillUnmount() {
        this.mounted = false
    }

    init() {
        this._yAnimation = this.state.position.interpolate({
            inputRange: [NEGATIVE_END_Y, 0],
            outputRange: [ANIMATION_END_Y, 0]
        });
        this._opacityAnimation = this._yAnimation.interpolate({
            inputRange: [0, ANIMATION_END_Y],
            outputRange: [1, 0]
        });
        this._scaleAnimation = this._yAnimation.interpolate({
            inputRange: [0, 15, 30],
            outputRange: [0, 1.2, 1],
            extrapolate: 'clamp'
        });
        this._xAnimation = this._yAnimation.interpolate({
            inputRange: [0, ANIMATION_END_Y/2, ANIMATION_END_Y],
            outputRange: [0, 15, 0]
        })
        this._rotateAnimation = this._yAnimation.interpolate({
            inputRange: [0, ANIMATION_END_Y/4, ANIMATION_END_Y/3, ANIMATION_END_Y/2, ANIMATION_END_Y],
            outputRange: ['0deg', '-2deg', '0deg', '2deg', '0deg']
        });
    }

    componentDidMount() {
        setTimeout(() => {
            Animated.timing(this.state.position, {
                duration: 2000,
                toValue: NEGATIVE_END_Y
            }).start(this.props.onComplete);
            //this.replay()

        }, this.props.start)   
    }
    
    getHeartAnimationStyle() {
      return {
        transform: [
          {translateY: this.state.position},
          {translateX: this._xAnimation},
          {scale: this._scaleAnimation},
          {rotate: this._rotateAnimation}
        ],
        opacity: this._opacityAnimation
      }
    }
    render() {
      return (
          <Animated.View style={[styles.heartWrap, this.getHeartAnimationStyle(), this.props.style, {right: this.props.right}]}>
            <Heart />
          </Animated.View>
      )
    }
  }

  var styles = StyleSheet.create({
    container: {
      flex: 1
    },
    heartWrap: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'transparent'
    },
    heart: {
        width: 20,
        height: 20,
        backgroundColor: 'transparent'
    },
    heartShape: {
        width: 6,
        height: 10,
        position: 'absolute',
        top: 0,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        backgroundColor: Color.green,
    },
    leftHeart: {
        transform: [
            {rotate: '-45deg'}
        ],
        position: 'absolute',
        left: 5,
        bottom: 0
    },
    rightHeart: {
        transform: [
            {rotate: '45deg'}
        ],
        position: 'absolute',
        right: 5,
        bottom: 0
    }
  });