import { createClient, collectionTransform } from 'redux-supermodel'
const client = createClient('https://mighty-harbor-19102.herokuapp.com/api')

export default client({
  contact: { urlRoot: 'contacts', idAttribute: '_id' },
  contacts: { urlRoot: 'contacts', idAttribute: '_id', transform: collectionTransform }
})
