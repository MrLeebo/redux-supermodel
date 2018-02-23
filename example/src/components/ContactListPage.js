import React from 'react'
import { Link } from 'react-router-dom'
import DataTable from './DataTable'
import ContactItem from './ContactItem'
import withContactsList from './withContactsList'

const source = 'https://github.com/MrLeebo/redux-supermodel/blob/master/example/src/components/ContactListPage.js'
const documentation = 'https://github.com/MrLeebo/redux-supermodel/blob/master/docs/api.md#resources'

export function ContactListPage(props) {
  const {
    contacts: { initialized, error, payload },
    fetchContacts,
    handleDestroy,
    toggleFavorite
  } = props

  if (!initialized) {
    if (error) {
      return <i className='text-danger'>An error occurred: {error.message}</i>
    } else {
      return <i className='fa fa-refresh fa-spin' />
    }
  }

  const colgroup = (
    <colgroup>
      <col style={{ width: 80 }} />
      <col style={{ width: '1*' }} />
      <col style={{ width: '1*' }} />
      <col style={{ width: 140 }} />
      <col style={{ width: 140 }} />
      <col style={{ width: 80 }} />
    </colgroup>
  )

  const thead = (
    <thead>
      <tr>
        <th />
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Last Updated</th>
        <th>Favorite</th>
      </tr>
    </thead>
  )

  return (
    <div className='container'>
      <div>
        <h1>
          <ul className='list-inline'>
            <li>contacts</li>
            <li><a target='_blank' href={source}><small>view source</small></a></li>
            <li className='pull-right'><a target='_blank' href={documentation}><small>documentation</small></a></li>
          </ul>

          <div className="pull-right">
            <button onClick={fetchContacts} className="btn btn-default">Refresh</button> <Link to="/contacts/new" className="btn btn-primary">Create New Contact</Link>
          </div>

          <p className='lead'>
            Uses a <a target='_blank' href={documentation}><code>resource</code></a> to retrieve a list of contacts, rendering links to each entry.
          </p>
        </h1>
      </div>
      <hr />

      {error && <i className='text-danger'>An error occurred: {error.message}</i>}

      <DataTable colgroup={colgroup} thead={thead}>
        {payload.data.map(contact => (
          <ContactItem
            key={contact._id}
            contact={contact}
            onDestroy={handleDestroy}
            onFavorite={toggleFavorite}
          />
        ))}
      </DataTable>
    </div>
  )
}

export default withContactsList(ContactListPage)
