import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
/* eslint-disable */
if (module.hot) {
  module.hot.accept();
}
// Force la désactivation pour le test
window.__webpack_hot_community_test__ = false;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
