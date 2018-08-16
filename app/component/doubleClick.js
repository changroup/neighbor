'use strict';

/*jshint esversion: 6*//*jshint node: true*/
import React, {Component, PropTypes} from 'react'
import { StyleSheet, TouchableWithoutFeedback } from 'react-native'

const clickInterval = 300
const longPressTime = 120

export default class DoubleClickView extends Component{

    constructor(props){
        super(props);
        this.state = {

        };
    };

    static propTypes = {
        onDoubleClick: PropTypes.func.isRequired,
        onClick: PropTypes.func.isRequired,
        style: PropTypes.object.isRequired
    }

    handleClick() {
        const _this = this
        const CT = new Date().getTime()
        if( CT - this.prevTime < clickInterval){//fast click
            this.count += 1
            if(this.count == 1) this.props.onDoubleClick()
        }
        else{
            this.count = 0
        }
        this.prevTime = CT
    }

    render(){
        return(
            <TouchableWithoutFeedback
                style={this.props.style}
                onPress={() => this.handleClick()}
                onLongPress={() => this.props.onClick()}
                delayLongPress={longPressTime}
            >
                {this.props.children}     
            </TouchableWithoutFeedback>
        );
    };
}

const styles = StyleSheet.create({
    
})