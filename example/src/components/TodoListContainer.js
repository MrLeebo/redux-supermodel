import TodoListPage from './TodoListPage'
import { todos } from '../lib/resources'
import bindResource from '../../../dist/bindResource'

export function mergeProps (stateProps, dispatchProps, ownProps) {
  const { busy, payload } = stateProps.todos

  return {
    ...ownProps,
    ...dispatchProps,
    busy,
    rows: payload && payload.data
  }
}

export default bindResource({ todos }, { mergeProps })(TodoListPage)
