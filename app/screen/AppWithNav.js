import React from 'react';
import {View} from 'react-native'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../redux/action'
import { connect } from 'react-redux'
import MainNavigator from './AppNavigator'
import { MessageBar } from 'react-native-messages';

class AppWithNav extends React.Component { 

  render() {
    return (
      <View style={{flex: 1}}>
        <MainNavigator/>
        <MessageBar/>        
      </View>
    );
  }
}


function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}

export default connect((state) => { 
    return {}
}, mapDispatchToProps)(AppWithNav);
