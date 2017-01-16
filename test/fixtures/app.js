import express from 'express'
const app = express()

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
