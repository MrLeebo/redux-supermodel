import 'babel-polyfill'
import createClient from './createClient'
import reducer from './reducer'
import { nuke } from './actionCreators'
import propType from './propType'
import bindResource from './bindResource'
import collectionTransform from './collectionTransform'

export { createClient, reducer, nuke, propType, bindResource, collectionTransform }
export default createClient
