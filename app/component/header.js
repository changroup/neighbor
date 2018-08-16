'use strict';

/*jshint esversion: 6*//*jshint node: true*/
import React, {Component, PropTypes} from 'react'
import {View, StyleSheet, Text, Platform } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../redux/action'
import Color from '../lib/color.js'
import { Header, Left, Right, Button } from 'native-base'
import Icon from 'react-native-vector-icons/Ionicons';

export class CustomHeader extends Component{

    constructor(props){
        super(props);
        this.state = {
            enableClick: true
        };
    };

    static propTypes = {
        onPressLeft: PropTypes.func.isRequired,
        onPressRight: PropTypes.func.isRequired,
        left: PropTypes.string.isRequired,
        right: PropTypes.string,
        title: PropTypes.string,
        backgroundColor: PropTypes.string,
        badge: PropTypes.bool
    }

    static defaultProps = {
        onPressLeft: () => undefined,
        onPressRight: () => undefined,
        backgroundColor: Color.blue,
        left: undefined,
        right: undefined,
        title: undefined,
        badge: false
    }

    onPressRight() {
        if(this.state.enableClick){
            this.setState({enableClick: false})     
            this.props.onPressRight()       
            setTimeout(() => {                
                this.setState({enableClick: true})
            }, 300)
        }
        
    }

    render(){
        const {backgroundColor, left, right, title, myBadgeNumber, badge} = this.props
        return(
            <Header style={{backgroundColor}}>
                <Left style={styles.leftbuttonView}>
                    <Button transparent onPress={() => this.props.onPressLeft()}>
                        <Icon name={left} size={30} color={Color.green}/>
                    </Button>
                </Left>
                <View style={styles.titleView}>
                    {Platform.OS === 'android' && <Text style={styles.title}>NEBZY</Text>}
                    {Platform.OS === 'ios' && <Text style={styles.title}>{title == undefined ? '' : title}</Text>}
                </View>
                <Right style={styles.rightbuttonView}>
                {
                    (right == undefined || right == 'none') ? null:
                    <Button transparent onPress={() => this.onPressRight()}>
                        <View>
                            <Icon name={right} size={35} color={Color.green}/>
                            {
                                myBadgeNumber > 0 && badge ? 
                                <View style={styles.badgeView}>
                                    <Text style={styles.badgeText}>{myBadgeNumber}</Text>
                                </View>
                                :null
                            }
                        </View>
                    </Button>                    
                }
                
                </Right>                
            </Header>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
    },
    navButtonText: {
        color: Color.white,
        fontSize: 18
    },
    titleView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 20,
        color: Color.green
    },
    badgeView: {
        position: 'absolute',
        right: -8,
        top: 0,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        backgroundColor: 'red',
        borderRadius: 12
    },
    badgeText: {
        textAlign: 'center',
        color: Color.white,
        backgroundColor: 'transparent'
    },
    leftbuttonView: {
        maxWidth: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'relative'
    },
    rightbuttonView: {
        maxWidth: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'flex-end',
        position: 'relative'
    }
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    appState: state.appState,
    myBadge: state.myBadge,
    myBadgeNumber: state.myBadgeNumber
  }
}, mapDispatchToProps)(CustomHeader);
