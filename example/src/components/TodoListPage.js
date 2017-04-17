import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './TodoList.css'
import TodoListTableRow from './TodoListTableRow'

const source = 'https://github.com/MrLeebo/redux-supermodel/blob/master/example/src/components/TodoListPage.js'
const documentation = 'https://github.com/MrLeebo/redux-supermodel/blob/master/docs/api.md'

export default class TodoListPage extends Component {
  state = { selected: null }

  handleChange = ({id, completed}) => {
    return this.props.updateTodos({ id, completed: !completed })
  }

  handleDelete = ({id}) => {
    return this.props.destroyTodos({ id })
  }

  handleEdit = ({id}) => {
    this.setState({ selected: id === this.state.selected ? null : id })
  }

  handleRefresh = () => {
    this.props.fetchTodos().then(this.deselectRow)
  }

  handleSubmitEdit = ({id, title}) => {
    return this.props.updateTodos({ id, title }).then(this.deselectRow)
  }

  deselectRow = () => {
    this.setState({ selected: null })
  }

  renderItem = todo => {
    return (
      <TodoListTableRow
        key={todo.id}
        todo={todo}
        onChange={this.handleChange}
        onDelete={this.handleDelete}
        onEdit={this.handleEdit}
        onSubmitEdit={this.handleSubmitEdit}
        pendingDelete={todo.pendingDelete}
        editing={this.state.selected === todo.id}
      />
    )
  }

  render() {
    const { busy, rows } = this.props

    return (
      <div>
        <div>
          <h1>
            <ul className="list-inline">
              <li>todo list</li>
              <li><a target="_blank" href={source}><small>view source</small></a></li>
              <li className="pull-right"><a target="_blank" href={documentation}><small>documentation</small></a></li>
            </ul>
            <p className="lead">
              This is an advanced component that combines several <em>redux-supermodel</em> features to display a list of tasks that can be interacted with individually.
            </p>
          </h1>
        </div>
        <hr />

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
          </div>

          <table className="table table-condensed table-hover">
            <thead>
              <tr>
                <th />
                <th>Todo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows && rows.map(this.renderItem)}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

TodoListPage.propTypes = {
  busy: PropTypes.bool,
  children: PropTypes.node,
  fetchTodos: PropTypes.func.isRequired
}
