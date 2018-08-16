import React, { Component } from 'react'
import {
    View, 
    StyleSheet, 
    Dimensions, 
    Text, 
    ScrollView
} from 'react-native'
import Color from '../../lib/color.js'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import CustomHeader from '../../component/header'
import ListItem from './listItem'

const Height = Dimensions.get('window').height

export class BlockUsers extends Component{
    constructor(props){
        super(props);
        this.state = {
            badges: []
        };
    }

    componentDidMount() {

    }

    onPressUser(user) {        
        this.props.navigation.navigate('profile', {user})
    }

    render() {
        const _this = this
        const {userInfo} = this.props
        const blockUsers = userInfo.blockUsers === undefined ? [] : JSON.parse(userInfo.blockUsers)
        return(
            <View style={styles.container}>    
                <CustomHeader
                    left='ios-arrow-back'
                    title='🌴🏢🏟🛣🛳🏨🌳'
                    onPressLeft={() => {
                        this.props.navigation.state.params.onBack();
                        this.props.navigation.goBack()
                    }}
                />       
                <ScrollView style={styles.scrollView}>
                    {
                        blockUsers.length == 0?
                            <Text style={styles.emptyText}>Nobody is blocked by you.</Text>
                        :blockUsers.map(function(userId) {
                            return (
                                <ListItem 
                                    key={userId} 
                                    uid={userId}
                                    type="block"
                                    onPressUser={(user) => _this.onPressUser(user)}
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
    myBadge: state.myBadge,
    likeUsers: state.likeUsers
  }
}, mapDispatchToProps)(BlockUsers);