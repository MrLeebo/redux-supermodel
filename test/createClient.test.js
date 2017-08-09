/* global $subject, $resource */
import assert from 'assert'
import createClient from '../lib/createClient'
import collectionTransform from '../lib/collectionTransform'

describe('createClient', () => {
  subject(createClient)

  describe('client', () => {
    it('should be a function', () => {
      assert.equal(typeof createClient, 'function')
    })

    it('should return a function', () => {
      assert.equal(typeof createClient(), 'function')
    })

    it('should assign url', () => {
      assert.equal(createClient('/blogs').baseUrl, '/blogs')
    })

    it('should assign options', () => {
      assert.equal(createClient({ test: true }).baseUrl, '/')
    })

    it('should assign base url', () => {
      assert.equal(createClient({}).baseUrl, '/')
    })

    it('should allow options', () => {
      assert.equal(createClient('/a', { url: '/b' }).baseUrl, '/a')
    })
  })

  describe('resource', () => {
    def('resource', () => $subject('todos', { urlRoot: 'todos' }))

    it('should require resource', () => {
      assert.throws($subject, 'name required')
    })

    it('should default the url', () => {
      const resource = $subject('todos')
      assert.equal(resource.url, 'todos')
    })

    it('should have key functions', () => {
      assert.equal(typeof $resource, 'function')
      assert.equal(typeof $resource.fetch, 'function')
      assert.equal(typeof $resource.create, 'function')
      assert.equal(typeof $resource.update, 'function')
      assert.equal(typeof $resource.destroy, 'function')
    })

    it('should not modify input options', () => {
      const p = {}
      $subject('todos', p)
      assert.deepEqual(p, {})
    })

    it('should copy custom options to resource', () => {
      const resource = $subject('todos', { specialProp: true })
      assert(resource.specialProp)
    })

    it('should retrieve state', () => {
      const state = $resource({ resource: { todos: { initialized: true, payload: { pass: true } } } })
      assert.deepEqual(state.payload, { pass: true })
    })

    describe('createCollection', () => {
      it('should return resource with transform applied', () => {
        const collection = $subject.createCollection('todos')
        assert.equal(collection.url, 'todos')
        assert.equal(collection.transform, collectionTransform)
      })

      it('should append custom transformer', () => {
        function myTransform () {}
        const collection = $subject.createCollection('todos', { transform: myTransform })
        assert.deepEqual(collection.transform, [collectionTransform, myTransform])
      })
    })
  })
})
