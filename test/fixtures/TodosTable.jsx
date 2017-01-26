import React from 'react'
import propType from '../../lib/propType'

export default function TodosTable ({resource}) {
  const { ready, payload, error } = resource

  if (!ready) return <div id='loading'>Please wait...</div>
  if (error) return <div className='error'>{error.response.data}</div>

  const rows = payload.data && payload.data.map((item) => (
    <tr key={item.id}>
      <td>{item.deleted && <del>{item.title}</del> || item.title}</td>
    </tr>
  ))

  return (
    <table>
      <tbody>
        {rows}
      </tbody>
    </table>
  )
}

TodosTable.propTypes = {
  resource: propType.isRequired
}
