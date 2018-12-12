import React, { Component } from 'react';
import { renderRoutes } from 'react-router-config';
import { HashRouter } from 'react-router-dom';

import routes from './router';


class App extends Component {
  render() {
    return (
		<HashRouter>
		  {/* kick it all off with the root route */}
		  {renderRoutes(routes)}
		</HashRouter>
    );
  }
}

export default App;
