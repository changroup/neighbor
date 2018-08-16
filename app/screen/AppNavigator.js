import React from 'react';

import {
  TabNavigator,
  StackNavigator,
  StackRouter
} from 'react-navigation';

import Splash from './Splash'
import IntroScreen from './Intro'
import Login from './Login'
import Home from './Home'
import Profile from './Profile'
import LikeUsers from './Profile/likeUsers'
import BlockUsers from './Profile/blockUsers'
import MessageList from './Messages'
import ChatView from './Chat'
import Wall from './Wall'
import CommentRoom from './Comment'
import PreviewImage from './Chat/preview'
import ViedoRecord from './Post/video'
import VideoPreview from './Wall/video'
import Terms from './Login/terms'

const MainNavigator = StackNavigator(
  {
    splash: { screen: Splash },
    intro: { screen: IntroScreen },
    login: { screen: Login },
    terms: { screen: Terms },
    home: { screen: Home },
    profile: { screen: Profile },
    message_list: { screen: MessageList },
    chat: { screen: ChatView },
    wall: { screen: Wall },
    preview: { screen: PreviewImage },
    video_record: { screen: ViedoRecord },
    video_preview: { screen: VideoPreview },
    likeUsers: { screen: LikeUsers },
    blockUsers: { screen: BlockUsers },
    comment: { screen: CommentRoom }
  },
  {
    headerMode: 'none',
  },
);

export default MainNavigator;
