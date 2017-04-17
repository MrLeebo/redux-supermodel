import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default function TodoListTableRow (props) {
  const {
    busy,
    todo,
    onChange,
    onDelete,
    onEdit,
    onSubmitEdit,
    editing,
    pendingDelete
  } = props

  const handleChange = () => onChange(todo)
  const handleDelete = () => onDelete(todo)
  const handleEdit = e => {
    e.preventDefault()
    e.stopPropagation()
    return onEdit(todo)
  }

  const handleUpdate = e => {
    e.preventDefault()
    return onSubmitEdit({ ...todo, title: e.target.title.value })
  }

  const trClasses = classNames({
    danger: pendingDelete
  })

  return (
    <tr className={trClasses}>
      <td className='text-center' onClick={handleChange}>
        <input
          type='checkbox'
          checked={todo.completed}
          disabled={busy}
          readOnly
        />
      </td>
      <td className='title' onClick={handleEdit}>
        {editing
          ? <form onSubmit={handleUpdate}><input type='text' className='form-control' name='title' autoFocus defaultValue={todo.title} onBlur={handleEdit} onClick={e => e.stopPropagation()} /></form>
          : <span>{todo.completed ? <strike>{todo.title}</strike> : todo.title}</span>
        }
      </td>
      <td className='text-right'>
        <button className='btn btn-link' disabled={busy} onClick={handleDelete}><i className='fa fa-trash' /></button>
      </td>
    </tr>
  )
}

const todoPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  completed: PropTypes.bool.isRequired
})

TodoListTableRow.propTypes = {
  busy: PropTypes.bool,
  todo: todoPropType.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired
}
