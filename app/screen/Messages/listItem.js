import React, {Component, PropTypes} from 'react'
import {
    View, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
} from 'react-native'
import Color from '../../lib/color.js'
import * as Service from '../../lib/service'
import Avatar from '../../component/avatar'

const photoWidth = 60

export default class ListItem extends Component{
    constructor(props){
        super(props);
        this.state = {
            user: {}
        };
    }

    static propTypes = {
        uid: PropTypes.string.isRequired,
        badge: PropTypes.string.isRequired,
        onPressUser: PropTypes.func.isRequired,
        onLongPressUser: PropTypes.func.isRequired
    }

    static defaultProps = {
        onPressUser: () => undefined
    }

    componentDidMount() {          
        Service.getUserData(this.props.uid, (user) => {
            this.setState({user})
        })
    }

    render() {
        const {user} = this.state
        const {badge} = this.props
        if(user.uid == undefined) return null
        return(
            <TouchableOpacity 
                onPress={() => this.props.onPressUser(user)} 
                style={styles.ItemView}
                delayLongPress={1000}
                onLongPress={() => this.props.onLongPressUser(user)}
            >
                <View style={styles.photoView}>
                    <Avatar 
                        userId={user.uid}
                        width = {photoWidth}
                    />
                </View>
                <Text style={styles.name}>{user.displayName}</Text>
                {
                    badge > 0 ?
                    <View style={styles.badgeView}>
                        <Text style={styles.badgeText}>{badge > 999 ? '999' : badge}</Text>
                    </View>
                    :null
                }                
            </TouchableOpacity>
        )
    }

}

const styles = StyleSheet.create({
    ItemView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 80,
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderColor: '#3DA0F188',
        marginHorizontal: 5
    },
    photoView: {
        width: photoWidth + 8,
        height: photoWidth + 8,
        borderRadius: photoWidth / 2 + 4,
        borderWidth: 2,
        padding: 2,
        borderColor: Color.blue,
        justifyContent: 'center',
        alignItems: 'center'
    },
    photo: {
        width: photoWidth,
        height: photoWidth,
        borderRadius: photoWidth / 2,
        overflow: 'hidden'
    },
    name: {
        color: Color.text,
        paddingLeft: 20,
        flex: 1,
        fontSize: 20
    },
    badgeView: {
        height: 30,
        width: 30,
        justifyContent: 'center',
        borderRadius: 15,
        backgroundColor: '#CC0000',
        overflow: 'hidden'
    },
    badgeText: {
        color: Color.white,
        textAlign: 'center'
    }
})