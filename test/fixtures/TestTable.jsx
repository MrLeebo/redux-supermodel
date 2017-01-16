import React from 'react'

export default function TestTable ({resource}) {
  const { ready, payload, error } = resource

  if (!ready) return <div>Please wait...</div>
  if (error) return <div className='error'>{error}</div>

  const rows = payload.body.map(({title}) => (
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
