import React from 'react'
import ReactDOM from 'react-dom'
import { nest, withProps } from 'recompose'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import '../node_modules/sw-toolbox/companion.js'
import App from './components/App'
import store from './lib/store'
import './index.css'

const AppProvider = withProps({ store })(Provider)
const Component = nest(HashRouter, AppProvider, App)

ReactDOM.render(
  <Component />,
  document.getElementById('root')
)
