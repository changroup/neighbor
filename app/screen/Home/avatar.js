import React, {Component, PropTypes} from 'react'
import {
    View, 
    StyleSheet, 
    Dimensions, 
    Text, 
    Animated,
    Easing
} from 'react-native'
import Color from '../../lib/color.js'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import * as Service from '../../lib/service'
import AnimatedHeart from './animated_heart'
import DoubleClickView from '../../component/doubleClick'
import Avatar from '../../component/avatar'

const Width = Dimensions.get('window').width
const maxWidth = Width * 0.32
const Hearts = [
    {
        id: 1,
        right: 0,
        start_in: 200 
    },
    {
        id: 2,
        right: 30,
        start_in: 400
    },
    {
        id: 3,
        right: 15,
        start_in: 600
    }
]

class HomeAvatar extends Component{
    constructor(props){
        super(props);
        this.state = {
            heartWidth: new Animated.Value(0),
            hearts: Hearts,
            failedImage: false
        };
    }

    static propTypes = {
        user: PropTypes.object.isRequired,
        onPress: PropTypes.func.isRequired,
        like: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        onPress: () => undefined,
    }

    componentDidMount() {
        if(this.props.like) this.onLike()
        this.prevTime = 0
        this.count = 0
    }

    getRandomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    onLike() {
        const {user, userInfo} = this.props
        
        this.setState({heartWidth: new Animated.Value(0)})

        setTimeout(() => {
            Animated.timing(
                this.state.heartWidth,
                {
                    toValue: maxWidth * 0.08,
                    easing: Easing.elastic(1.25),
                    duration: 300
                }
            ).start();
            this.count = 0
        }, 300)

        this.setState({hearts: this.state.hearts.concat(Hearts)})
        Service.likeUser(user.uid, userInfo)
    }

    render() {
        const _this = this
        const { heartWidth } = this.state
        const { user, userInfo, myBadgeNumber } = this.props
        return(
            <View style={styles.container}>
                <View style={{
                    width: 40, 
                    height: 30, 
                    position: 'absolute', 
                    backgroundColor: 'transparent', 
                    top: -10, 
                    right: -10, 
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Animated.Image 
                        source={require('../../resource/image/green_heart.png')} 
                        style={{
                            width: heartWidth, 
                            height: heartWidth,
                            resizeMode: 'stretch'
                        }} 
                    />
                </View>
                <DoubleClickView
                    style={styles.wrapper}
                    onClick={() => this.props.onPress(user)}
                    onDoubleClick={() => this.onLike()}
                >
                    <View style={styles.photoView}>
                        <Avatar userId={user.uid} width={maxWidth - 6} />
                        <View style={styles.animationView}>
                        {
                            this.state.hearts.map(function(v, i) {
                                return (
                                    <AnimatedHeart
                                        key={v.id}
                                        right={v.right}
                                        start={v.start_in}
                                        onComplete={() => _this.setState({hearts: []})}
                                        style={{width: 20, height: 10}}
                                    />
                                ) 
                            })
                        }
                        </View>                                                   
                    </View>
                </DoubleClickView>
                {
                    user.uid == userInfo.uid && myBadgeNumber > 0?
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{myBadgeNumber}</Text>
                    </View>
                    :null
                }     
                
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        width: maxWidth,
        height: maxWidth,
        marginLeft: Width * 0.01,
        marginTop: Width * 0.02,
        position: 'relative'
    },
    wrapper: {
        position: 'absolute',
        width: maxWidth,
        height: maxWidth,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    animationView: {
        position: 'absolute',
        bottom: 0,
        right: maxWidth / 2 - 20,
        width: 40,
        height: 60,
    },
    photoView: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        width: maxWidth,
        height: maxWidth,
        borderRadius: maxWidth / 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Color.blue,
        padding: 2,
        //backgroundColor: Color.white
    },
    badge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        minWidth: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'red'
    },
    badgeText: {
        color: Color.white,
        fontSize: 16
    },
    userImage: {
        width: maxWidth,
        height: maxWidth,
        borderRadius: maxWidth / 2,
        overflow: 'hidden'
        //resizeMode: 'stretch',
    }
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    userInfo: state.userInfo,
    myBadge: state.myBadge,
    myBadgeNumber: state.myBadgeNumber
  }
}, mapDispatchToProps)(HomeAvatar);