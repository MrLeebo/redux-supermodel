// This is the bare-minimum redux store for redux-supermodel to work

import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import promiseMiddleware from 'redux-promise-middleware'

import resource from '../../lib/reducer'

const rootReducer = combineReducers({ resource })
export default compose(applyMiddleware(promiseMiddleware()))(createStore)(rootReducer)
