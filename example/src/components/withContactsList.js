import { compose, lifecycle, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import resources from '../lib/resources'

export const mapProps = state => ({ contacts: resources.contacts(state) })

const actions = {
  fetchContacts: resources.contacts.fetch,
  resetContacts: resources.contacts.reset,
  updateContact: resources.contacts.update,
  destroyContact: resources.contacts.destroy
}

const spec = {
  componentDidMount() { this.props.fetchContacts() },
  componentWillUnmount() { this.props.resetContacts() }
}

const createHandlers = {
  handleDestroy: props => contact => {
    props.destroyContact(contact)
  },

  toggleFavorite: props => contact => {
    props.updateContact({ ...contact, favorite: !contact.favorite })
  }
}

export default compose(
  connect(mapProps, actions),
  lifecycle(spec),
  withHandlers(createHandlers)
)
