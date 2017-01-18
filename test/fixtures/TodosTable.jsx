import React from 'react'

export default function TodosTable ({resource}) {
  const { ready, payload, error } = resource

  if (!ready) return <div id='loading'>Please wait...</div>
  if (error) return <div className='error'>{error.response.data}</div>

  const rows = payload.data && payload.data.map(({title}) => (
    <tr key={title}><td>{title}</td></tr>
  ))

  return (
    <table>
      <tbody>
        {rows}
      </tbody>
    </table>
  )
}
