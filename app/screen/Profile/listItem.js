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
        type: PropTypes.string
    }

    static defaultProps = {
        onPressUser: () => undefined,
        type: 'like'
    }

    componentDidMount() {          
        Service.getUserData(this.props.uid, (user) => {
            this.setState({user})
        })
    }

    render() {
        const {user} = this.state
        const {type} = this.props
        if(user.uid == undefined) return null
        return(
            <TouchableOpacity onPress={() => this.props.onPressUser(user)} style={styles.ItemView}>
                <View style={styles.photoView}>
                    <Avatar
                        userId={user.uid}
                        width={photoWidth}
                    />
                </View>
                {
                    type === 'block' ?
                    <Text style={styles.name}>{user.displayName.split(' ')[0]}</Text>
                    :
                    <Text style={styles.name}>{user.displayName.split(' ')[0]}🏡  💚💚💚</Text>
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
        width: photoWidth + 4,
        height: photoWidth + 4,
        borderRadius: photoWidth / 2 + 2,
        borderWidth: 1,
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
        minWidth: 30,
        paddingHorizontal: 10,
        justifyContent: 'center',
        borderRadius: 15,
        backgroundColor: '#CC0000'
    },
    badgeText: {
        color: Color.white
    }
})