import React, { Component } from 'react'
import {
    View, 
    StyleSheet, 
    Dimensions, 
    Text, 
    ScrollView,
    Alert
} from 'react-native'
import Color from '../../lib/color.js'
import * as Service from '../../lib/service'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import CustomHeader from '../../component/header'
import ListItem from './listItem'

const Height = Dimensions.get('window').height


export class MessageList extends Component{
    constructor(props){
        super(props);
        this.state = {
            badges: []
        };
    }

    componentDidMount() {

    }

    onPressUser(user) {        
        Service.removeBadgeForUser(user.uid, this.props.userInfo)  
        this.props.joinChatRoom(this.props.userInfo.uid, user.uid, (roomID) => {
            this.props.navigation.navigate('chat', {userId: user.uid, roomID})
        })
    }

    onLongPressUser(user) {
        Alert.alert(
            'Nebzy🏡',
            this.props.userInfo.displayName.split(' ')[0] + ', do you really want to delete ' + user.displayName.split(' ')[0] + "'s message ? 🙊🙈",
            [
                {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'Yes', onPress: () => {
                    Service.removeUnreadUser(user.uid, this.props.userInfo)
                }},
            ],
            { cancelable: false }
        )    
    }

    render() {
        const _this = this
        const {myBadge, onTab, navigation} = this.props
        return(
            <View style={styles.container}>
                {
                    onTab ? 
                    <CustomHeader
                        left='ios-arrow-back'
                        title='🌴🏢🏟🛣🛳🏨🌳'
                        onPressLeft={() => this.props.onBack()}
                        navigation={navigation}
                    />
                    :
                    <CustomHeader
                        left='ios-arrow-back'
                        title='🌴🏢🏟🛣🛳🏨🌳'
                        onPressLeft={() => this.props.navigation.goBack()}
                    />
                }                
                <ScrollView style={styles.scrollView}>
                    {
                        myBadge.length == 0?
                            <Text style={styles.emptyText}>You have no unread message now.</Text>
                        :myBadge.map(function(badge) {
                            return (
                                <ListItem 
                                    key={badge.from} 
                                    uid={badge.from} 
                                    badge={badge.badge} 
                                    onPressUser={(user) => _this.onPressUser(user)}
                                    onLongPressUser={(user) => _this.onLongPressUser(user)}
                                />
                            )
                        })
                    }
                </ScrollView>   
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: Color.blue
    },
    scrollView: {
        backgroundColor: Color.white
    },
    emptyText: {
        color: Color.text,
        textAlign: 'center',
        marginTop: Height * 0.4
    }
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    appState: state.appState,
    userInfo: state.userInfo,
    myBadge: state.myBadge
  }
}, mapDispatchToProps)(MessageList);