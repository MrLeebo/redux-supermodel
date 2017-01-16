import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import promiseMiddleware from 'redux-promise-middleware'

import resource from '../../lib/reducer'

const rootReducer = combineReducers({ resource })
export default compose(applyMiddleware(promiseMiddleware()))(createStore)(rootReducer)
