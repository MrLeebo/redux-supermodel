import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import '../node_modules/sw-toolbox/companion.js'
import App from './components/App'
import store from './lib/store'
import './index.css'

function startApp () {
  ReactDOM.render(
    <HashRouter><Provider store={store}><App /></Provider></HashRouter>,
    document.getElementById('root')
  )
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('serviceWorker.js').then(startApp)
} else {
  startApp()
}
