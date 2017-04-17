import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import promiseMiddleware from 'redux-promise-middleware'
import { createLogger } from 'redux-logger'

import titleFormatter from './logTitleFormatter'
import resource from '../../../dist/reducer'

const loggerMiddleware = createLogger({ collapsed: true, titleFormatter })

const rootReducer = combineReducers({ resource })
export default compose(applyMiddleware(promiseMiddleware(), loggerMiddleware))(createStore)(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
