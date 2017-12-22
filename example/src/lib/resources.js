import { createClient, collectionTransform } from 'redux-supermodel'
const client = createClient('/api')

export default client({
  post: { urlRoot: 'posts' },
  posts: { url: 'posts' },
  todos: { urlRoot: 'tasks', transform: collectionTransform },
  users: true,
})
