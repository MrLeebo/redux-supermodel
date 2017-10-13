import { createClient, collectionTransform } from 'redux-supermodel'

const client = createClient('https://jsonplaceholder.typicode.com')

export default client({
  post: { urlRoot: 'posts' },
  posts: { url: 'posts' },
  todos: { urlRoot: 'todos', transform: collectionTransform },
  users: true,
})
