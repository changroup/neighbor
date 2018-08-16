import React, {Component, PropTypes} from 'react'
import {
    View, 
    StyleSheet, 
    Dimensions, 
    Text, 
} from 'react-native'
import Color from '../../lib/color.js'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ActionCreators } from '../../redux/action'
import * as Service from '../../lib/service'
import Avatar from '../../component/avatar'

const Width = Dimensions.get('window').width

class Comment extends Component{
    constructor(props){
        super(props);
        this.state = {

        };
    }

    static propTypes = {
        data: PropTypes.object.isRequired,
    }

    render() {
        const {data} = this.props
        return(
            <View style={styles.container}>
                <Avatar 
                    userId={data.uid}
                    width={45}
                />
                <View style={styles.commentView}>
                    <Text style={styles.commentText}>{data.text}</Text>
                    <Text style={styles.time}>{Service.convertToDayTime(data.timestamp)}</Text>
                </View>         
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        marginBottom: 25,
        alignItems: 'center'
    },
    commentView: {
        borderRadius: 4,
        marginTop: 5,
        backgroundColor: Color.darkgreen,
        padding: 10,
        width: Width * 0.9
    },
    commentText: {
        color: Color.black,
        lineHeight: 20
    },
    time: {
        color: Color.darkgray,
        fontSize: 10,
        paddingTop: 6,
        textAlign: 'right'
    },
    photo: {
        width: 45,
        height: 45,
        borderRadius: 45,
        overflow: 'hidden'
    }
})

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}
export default connect((state) => {
  return {   
    userInfo: state.userInfo,
  }
}, mapDispatchToProps)(Comment);