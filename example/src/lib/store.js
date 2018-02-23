import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import promiseMiddleware from 'redux-promise-middleware'
import { createLogger } from 'redux-logger'
import { reducer as resource } from 'redux-supermodel'
import { reducer as form } from 'redux-form'

import titleFormatter from './logTitleFormatter'

const loggerMiddleware = createLogger({ collapsed: true, titleFormatter })

const rootReducer = combineReducers({ resource, form })
export default compose(applyMiddleware(promiseMiddleware(), loggerMiddleware))(createStore)(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
