import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import App from './components/App'
import './index.css'

import store from './lib/store'

ReactDOM.render(
  <HashRouter><Provider store={store}><App /></Provider></HashRouter>,
  document.getElementById('root')
)
