import PostDetailPage from './PostDetailPage'
import { posts } from '../lib/resources'
import bindResource from '../../../dist/bindResource'

export function mount (props) {
  return props.fetchPosts({ id: props.match.params.id })
}

export function mergeProps (stateProps, dispatchProps, ownProps) {
  const {
    payload: {
      data: {
        id,
        title,
        body
      } = {}
    } = {}
  } = stateProps.posts

  return { ...ownProps, ...dispatchProps, id, title, body }
}

export default bindResource({ posts }, { mount, mergeProps })(PostDetailPage)
