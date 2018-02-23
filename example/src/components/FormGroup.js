import React from 'react'

export default function FormGroup({label, children}) {
  return (
    <div className='form-group'>
      <label className='control-label col-md-1'>{label}</label>
      <div className='col-md-11'>
        {children}
      </div>
    </div>
  )
}
