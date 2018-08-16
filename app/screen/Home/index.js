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
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import dismissKeyboard from 'react-native-dismiss-keyboard';

import NearBy from './nearby'
import Wall from '../Wall'
import MessageList from '../Messages'

const Height = Dimensions.get('window').height
const Width = Dimensions.get('window').width
const ImageHeight = Width * 0.5

export class Home extends Component{
    constructor(props){
        super(props);
        this.state = {
            tabIndex: 0
        };
    }

    static propTypes = {
        onTab: PropTypes.bool
    }

    static defaultProps = {
        onTab: false
    }

    componentWillMount() {
        this.props.fetchBadges(this.props.userInfo)
        Service.listenUserData(this.props.userInfo.uid, (data) => {
            this.props.saveUserInfo(data)
        })
    }

    onLoadServiceTab(tabIndex) {
        this.setState({tabIndex})
        dismissKeyboard()     
    }

    render() {
        return(
            <View style={{flex: 1}}>           
                <ScrollableTabView 
                    style={{backgroundColor: Color.white}}
                    renderTabBar={() => <View style={{height: 0}}/>}
                    initialPage={0}
                    onChangeTab={(tab) => this.onLoadServiceTab(tab.i)}
                    tabBarPosition='bottom'
                    page={this.state.tabIndex}
                >
                    <NearBy
                        key='NearBy'
                        tabLabel='NearBy'
                        handle={this.props}
                        onPressWall={() => this.setState({tabIndex: 1})}
                    />         
                    <Wall 
                        key='Wall' 
                        tabLabel='Wall'
                        handle={this.props} 
                        onPressBack={() => this.setState({tabIndex: 0})}
                        onPressBubble={() => this.setState({tabIndex: 2})}
                    />
                    <MessageList 
                        key='Messages' 
                        onTab={true}  
                        tabLabel='Messages'
                        navigation={this.props.navigation}
                        onBack={() => this.setState({tabIndex: 1})}
                    />
                </ScrollableTabView>     
            </View>
        )
    }

}

const styles = StyleSheet.create({
    
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    appState: state.appState,
    userInfo: state.userInfo,
    myLocation: state.myLocation,
    nearByUsers: state.nearByUsers
  }
}, mapDispatchToProps)(Home);