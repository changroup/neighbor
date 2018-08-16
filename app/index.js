import React from 'react';
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from 'redux'
import appReducer from './redux/reducer/index'
import AppWithNav from './screen/AppWithNav'


let store = createStore(appReducer, {}, applyMiddleware(thunkMiddleware))
console.disableYellowBox = true;

export default class Neighbor extends React.Component {
  render() {
      return <Provider store={store}><AppWithNav/></Provider>;
  }
}