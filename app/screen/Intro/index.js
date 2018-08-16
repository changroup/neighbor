'use strict';

/*jshint esversion: 6*//*jshint node: true*/
import React, {Component} from 'react';
import {Text, AsyncStorage, View, StyleSheet,Image, Dimensions, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import Swiper from 'react-native-swiper';
import Color from '../../lib/color'

const Width = Dimensions.get('window').width
const IntroImage1 = require('../../resource/image/intro1.jpg')
const IntroImage2 = require('../../resource/image/intro2.jpg')
const IntroImage3 = require('../../resource/image/intro3.jpg')
const IntroImage4 = require('../../resource/image/intro4.jpg')

const pageData = [
  {
    top: 'Nebzy🏡',
    image: IntroImage1,
    bottom: "See who's around in real time🌴🏢"
  },
  {
    top: 'Nebzy🏡',
    image: IntroImage2,
    bottom: "Send and receive unlimited likes💚💚💚"
  },
  {
    top: 'Nebzy🏡',
    image: IntroImage3,
    bottom: "Chat, Talk, Post for Free🍀😍"
  },
  {
    top: 'Nebzy🏡',
    image: IntroImage4,
    bottom: "Welcome to your neighborhood🏡🏨🏢🌴"
  }
]
export class IntroScreen extends Component{

  constructor(props){
    super(props);
    this.state = {
      pageIndex: 0
    };
  };

  _onMomentumScrollEnd(e, state, context) {
    this.setState({pageIndex: state.index})
  }

  onGetStarted() {
    AsyncStorage.setItem('started', 'true')
    this.props.navigation.navigate('login')
  }

  render(){
    return(
      <View style={styles.container}>
        <Swiper activeDotColor='black' loop={false} onMomentumScrollEnd ={this._onMomentumScrollEnd.bind(this)}>
          {
            pageData.map(function(page, index){
              return(
                <View key={index} style={styles.slideView}>
                  <Text style={styles.stepText}>{page.top}</Text>                  
                  <Image source={page.image} style={styles.image} />
                  <Text style={styles.stepText}>{page.bottom}</Text>
                </View>
              )
            })
          }
        </Swiper>
        {
          this.state.pageIndex == 3?
          <TouchableOpacity style={styles.buttonView} onPress={() => this.onGetStarted()}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          :null
        }        
      </View>
    
    );
  };
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: Color.white, 
        paddingBottom: 90
    },
    slideView: {
        flex: 1,
        backgroundColor: Color.white, 
        paddingVertical: 60,
    },
    stepText: {
      paddingVertical: 30,
      fontSize: 18,
      color: Color.text,
      textAlign: 'center'
    },
    image: {
      flex: 1,
      width: Width,
      resizeMode: 'cover',
    },
    buttonView: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 40,
        height: 40,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Color.blue,
        borderRadius: 4,
    },
    buttonText: {       
        fontSize: 16,
        fontWeight: 'bold',
        color: Color.blue,
        textAlign: 'center',
        backgroundColor: 'transparent',        
    }
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    r_appState: state.appState
  }
}, mapDispatchToProps)(IntroScreen);
