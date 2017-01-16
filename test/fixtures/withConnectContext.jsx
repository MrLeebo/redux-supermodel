import React from 'react'
import { Provider } from 'react-redux'
import store from './store'

export default function withConnectContext (WrappedComponent, props = {}) {
  return (
    <Provider store={store}>
      <WrappedComponent {...props} />
    </Provider>
  )
}
