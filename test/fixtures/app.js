// This is a mock API for integration testing

import express from 'express'
import bodyParser from 'body-parser'
const app = express()

export const UNAUTHORIZED = 'Unauthorized'
export const AUTHORIZED = 'You seem cool'
export const TITLE_REQUIRED = 'title required'

export const TODO_ITEM = { id: 1, title: 'Get milk' }
export const TODO_LIST = [
  { id: 1, title: 'Get milk' },
  { id: 2, title: 'Wash cat' },
  { id: 3, title: 'Eat food' },
  { id: 4, title: 'Take nap' }
]

export const NOTIFICATION = { id: 1, message: 'Your work will begin shortly.', user_id: 10 }
export const NOTIFICATION_MISSING = 'Notification not found'

export const FORTUNE = 'The early bird gets the worm but the second mouse gets the cheese'

export const POST = { id: 1, title: 'Hello, world!', body: 'This is a post.' }

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/admin', (req, res) => {
  if (req.get('X-Auth-Token') !== 'TOKEN') {
    res.status(401).send(UNAUTHORIZED)
  } else {
    res.status(200).send(AUTHORIZED)
  }
})

app.delete('/todos/1', (req, res) => {
  res.status(204).send()
})

app.get('/todos/1', (req, res) => {
  res.status(200).send(TODO_ITEM)
})

app.post('/todos', (req, res) => {
  if (!req.body.title) {
    res.status(400).send(TITLE_REQUIRED)
  } else {
    res.status(201).send({ id: 5, title: req.body.title })
  }
})

app.use('/todos', (req, res) => {
  res.status(200).send(TODO_LIST)
})

app.use('/fortunecookie', (req, res) => {
  res.status(200).send(FORTUNE)
})

app.put('/notifications', (req, res) => {
  if (req.body.notification && req.body.notification.id) {
    res.status(200).send(NOTIFICATION)
  } else {
    res.status(404).send(NOTIFICATION_MISSING)
  }
})

app.get('/posts/1', (req, res) => {
  res.status(200).send(POST)
})

app.put('/posts/1', (req, res) => {
  res.status(200).send(req.body)
})

app.use((req, res) => {
  res.status(200).send(req.url)
})

export default app
