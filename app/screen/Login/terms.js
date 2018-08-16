'use strict';

/*jshint esversion: 6*//*jshint node: true*/
import React, {Component} from 'react'
import {View, Text, StyleSheet, ScrollView, AsyncStorage, TouchableOpacity} from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Container } from 'native-base'
import { ActionCreators } from '../../redux/action'
import Color from '../../lib/color.js'
import CustomHeader from '../../component/header'

export class Terms extends Component{

    constructor(props){
        super(props);
        this.state = {
            
        };
    };

    onAcceptTerms() {
        AsyncStorage.setItem('terms_accpeted', 'true', () => {
            this.props.navigation.navigate('home')       
        });
    }

    render(){
        return(
            <Container>
                <CustomHeader
                    left='ios-arrow-back'
                    title='🌴🏢🏟🛣🛳🏨🌳'
                    onPressLeft={() => this.props.navigation.goBack()}
                />
                <ScrollView style={{flex: 1}} contentContainerStyle={{paddingBottom: 30}}>
                    <View style={{alignItems: 'center'}}>
                        <Text style={styles.termText}>
                        { 
                            "Hi " + this.props.userInfo.displayName.split(' ')[0] + "! 😀\n" +
                            "Welcome to Nebzy🏡 \n"+
                            "We are thrilled that you are here. \n\n"+
                            "Everything here can be done with one swipe left or right, tap once or twice, press and hold. So go ahead and play with these actions and see what you can do.\n\n"+
                            "To start, you need to log in with your Facebook or Google account. Once you’re logged in, You will see everyone around you in real time. Tap twice to send them likes. 💚💚💚\n\n"+
                            "If you press and hold your photo it will take you to your profile you can see who likes you,💚 your mailbox 📬and your block list. 🙅🏼‍♀️\n"+
                            "If you press and hold others pictures you can send them instant message. \n\n"+
                            "Swipe left to see your local feed and interact with the people around you via Text, picture or Audio. \n\n"+
                            "▪️We will never share your information or your specific location with any third party. \n"+
                            "▪️Please be polite,any inappropriate behavior will force us to block and delete your account. \n"+
                            "▪️This is not a marketplace,therefore selling any items or services is strictly prohibited.\n\n"+
                            "This is a living breathing App we will make the rules as we go. For now, sit tight,and have fun with your neighbors. \n\n"+
                            "Nebzy🏡Team👨🏼‍💻"                     
                        }
                        </Text>
                        <TouchableOpacity style={styles.acceptButton} onPress={this.onAcceptTerms.bind(this)}>
                            <Text style={styles.acceptText}>Accept</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>           
            </Container>        
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: Color.white
    },
    termText: {
        padding: 15,
        fontSize: 20,
        color: Color.text
    },
    acceptButton: {
        backgroundColor: Color.green,
        borderRadius: 6,
        paddingVertical: 15,
        paddingHorizontal: 30
    },
    acceptText: {
        fontSize: 20,
        color: 'white'
    }
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    userInfo: state.userInfo,
  }
}, mapDispatchToProps)(Terms);
