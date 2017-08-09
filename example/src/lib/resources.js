import { createClient } from 'redux-supermodel'

const client = createClient('https://jsonplaceholder.typicode.com')

export const posts = client('posts', { urlRoot: 'posts' })
export const users = client('users')
export const todos = client.createCollection('todos', { urlRoot: 'todos' })
