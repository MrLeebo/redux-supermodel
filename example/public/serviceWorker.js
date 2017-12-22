(global => {
  'use strict'

  importScripts('sw-toolbox.js')

  let maxId = 0
  let tasks = [
    { id: maxId++, title: 'Learn redux-supermodel', completed: false }
  ]

  let posts = [
    {
      id: maxId++,
      title: 'Hello, world!',
      author: 'Jeremy Liberman',
      body: 'This is a blog post about stuff.',
      posted: new Date()
    }
  ]

  function send(status, data) {
    if (!data) {
      return new Response(null, { status })
    }

    const headers = new Headers({ "Content-Type": "application/json;charset=UTF-8" })
    return new Response(JSON.stringify(data), { status, headers })
  }

  const { router } = global.toolbox

  router.get('/api/tasks', () => {
    return send(200, tasks)
  })

  router.get('/api/tasks/:id', (req, values) => {
    const task = tasks.find(task => task.id == values.id)

    if (!task) {
      return send(404, { message: "Not found" })
    }

    return send(200, task)
  })

  router.post('/api/tasks', req => {
    return new Promise(done => {
      req.json().then(task => {
        if (!task) {
          return done(send(400, { message: "Task is required." }))
        }

        const added = { ...task, id: maxId++, completed: false }
        tasks.push(added)
        done(send(201, added))
      })
    })
  })

  router.put('/api/tasks/:id', (req, values) => {
    return new Promise(done => {
      req.json().then(data => {
        const task = tasks.find(task => task.id == values.id)

        if (!task) {
          done(send(404, { message: "Not found" }))
        }

        const updated = { ...task, ...data }
        tasks[values.id] = updated
        done(send(200, updated))
      })
    })
  })

  router.delete('/api/tasks/:id', (req, values) => {
    tasks = tasks.filter(task => task.id != values.id)
    return send(204)
  })

  router.get('/api/posts', (req, values) => {
    return send(200, posts)
  })

  router.get('/api/posts/:id', (req, values) => {
    const post = posts.find(post => post.id  == values.id)

    if (!post) {
      return send(404, { message: "Not found" })
    }

    return send(200, post)
  })

  router.post('/api/posts', req => {
    return new Promise(done => {
      req.json().then(post => {
        if (!post) {
          return done(send(400, { message: "Post is required." }))
        }

        const added = { ...post, id: maxId++, posted: new Date() }
        posts.push(added)
        done(send(201, added))
      })
    })
  })

  router.put('/api/posts/:id', (req, values) => {
    return new Promise(done => {
      req.json().then(data => {
        const i = posts.findIndex(post => post.id == values.id)
        const post = posts[i]

        if (!post) {
          done(send(404, { message: "Not found" }))
        }

        const updated = { ...post, ...data, posted: new Date() }
        posts[i] = updated
        done(send(200, updated))
      })
    })
  })

  global.addEventListener('install', e => e.waitUntil(global.skipWaiting()))
  global.addEventListener('activate', e => e.waitUntil(global.clients.claim()))
})(self)
