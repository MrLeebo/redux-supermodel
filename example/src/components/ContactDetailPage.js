import React from 'react'
import { Field } from 'redux-form'
import { Link } from 'react-router-dom'
import FormGroup from './FormGroup'
import withContactForm from './withContactForm'

const source = 'https://github.com/MrLeebo/redux-supermodel/blob/master/example/src/components/ContactDetailPage.js'
const documentation = 'https://github.com/MrLeebo/redux-supermodel/blob/master/docs/api.md#resources'

function required(val) {
  if (!val) return "Required"
}

export function ContactDetailPage(props) {
  const { contact: { initialized, error }, pristine, invalid, handleSubmit } = props

  if (!initialized) {
    if (error) {
      return <i className='text-danger'>An error occurred: {error.message}</i>
    } else {
      return <i className='fa fa-refresh fa-spin' />
    }
  }

  return (
    <form name="details" className='form form-horizontal' onSubmit={handleSubmit}>
      <div>
        <h1>
          <ul className='list-inline'>
            <li>view contact</li>
            <li><a target='_blank' href={source}><small>view source</small></a></li>
            <li className='pull-right'><a target='_blank' href={documentation}><small>documentation</small></a></li>
          </ul>

          <div className='pull-right'>
            <Link to='/contacts' className='btn btn-default'>Back</Link>
          </div>

          <p className='lead'>
            Fetches a contact <a target='_blank' href={documentation}><code>resource</code></a> to show details.
          </p>
        </h1>
      </div>
      <hr />

      {error && <i className='text-danger'>An error occurred: {error.message}</i>}

      <FormGroup label="Name">
        <Field
          name="name"
          component="input"
          type="text"
          className='form-control'
          validate={required}
          autoFocus
        />
      </FormGroup>

      <FormGroup label="Email">
        <Field
          name="email"
          component="input"
          type="email"
          className="form-control"
        />
      </FormGroup>

      <FormGroup label="Phone">
        <Field
          name="phone"
          component="input"
          type="phone"
          className="form-control"
        />
      </FormGroup>

      <FormGroup>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={pristine || invalid}
        >
          Submit
        </button>
      </FormGroup>
    </form>
  )
}

export default withContactForm(ContactDetailPage)
