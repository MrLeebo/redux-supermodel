import React, { Component } from 'react'

export default class TodoListForm extends Component {
  refTitle = ref => this.title = ref

  handleSubmit = e => {
    e.preventDefault()
    this.props.onSubmit(this.title.value)
    this.title.value = ""
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="input-group" style={{ width: '100%' }}>
          <input type="text" className="form-control" placeholder="Add a new task" autoFocus ref={this.refTitle} />
          <div className="input-group-btn">
            <button
              type="submit"
              className="btn btn-default"
            ><i className="fa fa-plus" /></button>
          </div>
        </div>
      </form>
    )
  }
}
