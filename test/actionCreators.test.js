import assert from 'assert'
import { resourceActionCreators } from '../lib/actionCreators'

describe('actionCreators', () => {
  let subject
  const baseUrl = 'http://localhost'

  it('should require resource', () => {
    assert.throws(resourceActionCreators, 'Resource definition required')
  })

  it('should require url', () => {
    const msg = 'Invalid resource definition: Missing required field or function "url" or "urlRoot"'
    assert.throws(() => resourceActionCreators(baseUrl, null, {}), msg)
  })

  it('should generate action creators', () => {
    const actions = ['reset', 'fetch', 'create', 'update', 'destroy']
    subject = resourceActionCreators(baseUrl, 'blogs', { url: 'blogs' })

    assert.deepEqual(Object.keys(subject), actions)
    actions.forEach(action => assert.equal(typeof subject[action], 'function'))
  })

  /*
  it('should create POST action', (t) => {
    mockAgent();

    const definition = { url: '/endpoint' };
    subject = resourceActionCreators(baseUrl, 'blogs', definition, { agent: agent });

    const data = { owner: 'Steve' };
    const result = subject.create(data);

    t.is(result.type, '@@redux-supermodel/REQUEST');
    t.true(result.payload instanceof Promise);
    t.deepEqual(result.meta, {
      action: 'create',
      method: 'POST',
      url: 'http://localhost/endpoint',
      resourceName: 'blogs',
      definition,
    });
  });

  it('should create POST action with urlRoot', (t) => {
    mockAgent();

    const definition = { urlRoot: '/endpoint' };
    subject = resourceActionCreators(baseUrl, 'blogs', definition, { agent: agent.post });

    const data = { owner: 'Steve' };
    const result = subject.create(data);

    t.is(result.type, '@@redux-supermodel/REQUEST');
    t.true(result.payload instanceof Promise);
    t.deepEqual(result.meta, {
      action: 'create',
      method: 'POST',
      url: 'http://localhost/endpoint',
      resourceName: 'blogs',
      definition,
    });
  });

  it('should update PUT action', (t) => {
    mockAgent();

    const definition = { urlRoot: '/endpoint' };
    subject = resourceActionCreators(baseUrl, 'blogs', definition, { agent: agent.post });

    const data = { id: 999, owner: 'Eve' };
    const result = subject.update(data);

    t.is(result.type, '@@redux-supermodel/REQUEST');
    t.true(result.payload instanceof Promise);
    t.deepEqual(result.meta, {
      action: 'update',
      method: 'PUT',
      url: 'http://localhost/endpoint/999',
      resourceName: 'blogs',
      definition,
    });
  });

  it('should create RESET action', (t) => {
    mockAgent();

    const definition = { urlRoot: '/endpoint' };
    subject = resourceActionCreators(baseUrl, 'blogs', definition, { agent: agent.post });

    const data = { id: 999, owner: 'Bob' };
    const result = subject.reset(data);

    t.is(result.type, '@@redux-supermodel/RESET');
    t.is(result.payload, data);
    t.deepEqual(result.meta, { definition });
  });

  it('should subscribe to events', (t) => {
    mockAgent();
    agent.on = stub();

    const definition = { url: '/endpoint' };
    subject = resourceActionCreators(baseUrl, 'blogs', definition, {
      agent: agent.post,
      events: { request: () => {} },
    }); // TODO: fix this

    subject.create({ owner: 'Eve' });

    t.true(agent.on.calledOnce);
  });
  */
})
