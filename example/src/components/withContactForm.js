import { compose, lifecycle, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { reduxForm } from 'redux-form'
import resources from '../lib/resources'

export function mapProps (state) {
  const contact = resources.contact(state)
  return { contact, initialValues: contact.payload.data }
}

const config = { form: 'contactDetails', enableReinitialize: true }

const actions = {
  fetchContact: _id => resources.contact.fetch({_id}),
  saveContact: values => resources.contact[values._id ? 'update' : 'create'](values),
  resetContact: resources.contact.reset
}

const onSubmit = props => async values => {
  await props.saveContact({ ...values, updated_at: new Date() })
  props.history.push('/contacts')
}

const spec = {
  componentDidMount() {
    const {
      match: { params: { id } },
      fetchContact,
      resetContact
    } = this.props

    if (id !== 'new') {
      fetchContact(id)
    } else {
      resetContact({})
    }
  },

  componentWillReceiveProps(nextProps) {
    const {
      match: { params: { id } },
      fetchContact
    } = nextProps

    if (this.props.match.params.id !== id) {
      fetchContact(id)
    }
  },

  componentWillUnmount() {
    this.props.resetContact()
  }
}

export default compose(
  connect(mapProps, actions),
  lifecycle(spec),
  withHandlers({ onSubmit }),
  reduxForm(config),
)
