import express from 'express'
const app = express()

export const UNAUTHORIZED = 'Unauthorized'
export const AUTHORIZED = 'You seem cool'

export const TODO_ITEM = { title: 'Get milk' }
export const TODO_LIST = [
  { title: 'Get milk' },
  { title: 'Wash cat' },
  { title: 'Eat food' },
  { title: 'Take nap' }
]

export const FORTUNE = 'The early bird gets the worm but the second mouse gets the cheese'

app.use('/admin', (req, res) => {
  if (req.get('X-Auth-Token') !== 'TOKEN') {
    res.status(401).send(UNAUTHORIZED)
  } else {
    res.status(200).send(AUTHORIZED)
  }
})

app.use('/todos/1', (req, res) => {
  res.status(200).send(TODO_ITEM)
})

app.use('/todos', (req, res) => {
  res.status(200).send(TODO_LIST)
})

app.use('/fortunecookie', (req, res) => {
  res.status(200).send(FORTUNE)
})

app.use((req, res) => {
  res.status(200).send(req.url)
})

export default app
