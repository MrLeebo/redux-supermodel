import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './components/App'
import './index.css'

import store from './lib/store'

ReactDOM.render(
  <BrowserRouter><Provider store={store}><App /></Provider></BrowserRouter>,
  document.getElementById('root')
)
