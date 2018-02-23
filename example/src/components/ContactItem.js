import React from 'react'
import { Link } from 'react-router-dom'
import { withHandlers } from 'recompose'

export function ContactItem(props) {
  const { contact, handleDestroy, handleFavorite } = props

  return (
    <tr>
      <td className="text-center">
        <button className="btn btn-link" onClick={handleDestroy} style={{ padding: 0 }}>
          <i className="fa fa-trash" />
        </button>
      </td>
      <td><Link to={`/contacts/${contact._id}`}>{contact.name}</Link></td>
      <td>{contact.email}</td>
      <td>{contact.phone}</td>
      <td className="text-muted">{new Date(contact.updated_at).toLocaleDateString()}</td>
      <td><input type="checkbox" checked={contact.favorite || false} onChange={handleFavorite} /></td>
    </tr>
  )
}

export default withHandlers({
  handleDestroy: props => () => {
    props.onDestroy(props.contact)
  },

  handleFavorite: props => () => {
    props.onFavorite(props.contact)
  }
})(ContactItem)
