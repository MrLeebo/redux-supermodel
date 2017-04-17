import PostListPage from './PostListPage'
import { posts } from '../lib/resources'
import bindResource from '../../../dist/bindResource'

export function mergeProps (stateProps, dispatchProps, ownProps) {
  const { payload } = stateProps.posts

  return {
    ...ownProps,
    ...dispatchProps,
    rows: payload && payload.data
  }
}

export default bindResource({ posts }, { mergeProps })(PostListPage)
