import React, {Component} from 'react'
import {
    View, 
    AsyncStorage
} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import SplashScreen from 'react-native-splash-screen'
import { ActionCreators } from '../../redux/action'

export class Splash extends Component{
    constructor(props){
        super(props);
        this.state = {
            
        };
    }

    componentDidMount() {
        const _this = this
        setTimeout(function() {            
            SplashScreen.hide();
            AsyncStorage.getItem('started', (err, value) => {
                if(!err && value != null){
                    _this.props.navigation.navigate('login')
                }
                else{
                    _this.props.navigation.navigate('intro')
                }
            })
        }, 3000)
    }

    render() {
        return(
            <View style={{flex: 1}} />
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    appState: state.appState
  }
}, mapDispatchToProps)(Splash);