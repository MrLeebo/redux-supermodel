import express from 'express'
const app = express()

app.use('/admin', (req, res) => {
  if (req.get('X-Auth-Token') !== 'TOKEN') {
    res.status(401).send('Unauthorized')
  } else {
    res.status(200).send('You seem cool')
  }
})

app.use('/todos', (req, res) => {
  res.status(200).send([
    { title: 'Get milk' },
    { title: 'Wash cat' },
    { title: 'Eat food' },
    { title: 'Take nap' }
  ])
})

app.use('/todos/1', (req, res) => {
  res.status(200).send({ title: 'Get milk' })
})

app.use((req, res) => {
  res.status(200).send(req.url)
})

export default app
