import React from 'react';
import { connect } from 'react-redux';

import App from '../App.js';

const mapStateToProps = (state, ownProps) => {
  return {
  };
};

const AppContainer = connect(mapStateToProps)(App);

export default AppContainer;
