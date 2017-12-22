import React, { Component } from 'react'
import { connect } from 'react-redux'
import './TodoList.css'
import TodoListForm from './TodoListForm'
import TodoListTableRow from './TodoListTableRow'
import resources from '../lib/resources'

const source = 'https://github.com/MrLeebo/redux-supermodel/blob/master/example/src/components/TodoListPage.js'
const documentation = 'https://github.com/MrLeebo/redux-supermodel/blob/master/docs/api.md'

export class TodoListPage extends Component {
  state = { selected: null }

  componentDidMount = () => {
    if ('serviceWorker' in window.navigator) {
      this.props.fetch()
    }
  }

  componentWillUnmount = () => this.props.reset()

  handleEdit = ({id}) => {
    this.setState({ selected: id === this.state.selected ? null : id })
  }

  handleRefresh = async () => {
    await this.props.fetch()
    this.setState({ selected: null })
  }

  handleSubmitEdit = async todo => {
    await this.props.update(todo)
    this.setState({ selected: null })
  }

  handleSubmitAdd = title => {
    this.props.create({ title })
  }

  refTitle = ref => this.title = ref

  renderItem = (todo, n) => {
    const { toggle, destroy } = this.props

    return (
      <TodoListTableRow
        key={n}
        todo={todo}
        onChange={toggle}
        onDelete={destroy}
        onEdit={this.handleEdit}
        onSubmitEdit={this.handleSubmitEdit}
        editing={this.state.selected === n}
      />
    )
  }

  renderPanel = () => {
    const { busy, error, data } = this.props

    const colgroup = (
      <colgroup>
        <col style={{ width: 90 }} />
        <col style={{ width: "1*" }} />
        <col style={{ width: 90 }} />
      </colgroup>
    )

    return (
      <div className="panel panel-info">
        <div className="panel-heading">
          <button
            type="button"
            className="btn btn-default"
            disabled={busy}
            onClick={this.handleRefresh}
          >
            {busy && <i className="fa fa-refresh fa-spin" />} Refresh
          </button>

          {error && <span className="text-danger">{error.message}</span>}
        </div>

        <table className="table-heading">
          {colgroup}
        </table>

        <div className="table-body">
          <table className="table table-condensed table-hover">
            {colgroup}
            <tbody>
              <tr>
                <td colSpan={3}>
                  <TodoListForm onSubmit={this.handleSubmitAdd} />
                </td>
              </tr>
              {data.map(this.renderItem)}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div>
        <div>
          <h1>
            <ul className="list-inline">
              <li>task list</li>
              <li><a target="_blank" href={source}><small>view source</small></a></li>
              <li className="pull-right"><a target="_blank" href={documentation}><small>documentation</small></a></li>
            </ul>
            <p className="lead">
              This is an advanced component that combines several <em>redux-supermodel</em> features to display a list of tasks that can be interacted with individually.
            </p>
          </h1>
        </div>
        <hr />

        {('serviceWorker' in window.navigator) ? this.renderPanel() : <div className="help-block">Sorry, this demo requires a browser that supports service workers.</div>}
      </div>
    )
  }
}

export function mapProps (state) {
  const { busy, error, payload: { data = [] } } = resources.todos(state)
  return { busy, error, data }
}

const actions = {
  fetch: resources.todos.fetch,
  create: resources.todos.create,
  update: resources.todos.update,
  toggle: todo => resources.todos.update({ ...todo, completed: !todo.completed }),
  destroy: resources.todos.destroy,
  reset: resources.todos.reset,
}

export default connect(mapProps, actions)(TodoListPage)
