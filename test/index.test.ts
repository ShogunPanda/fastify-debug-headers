/* eslint-disable @typescript-eslint/no-floating-promises */

import fastify, { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify'
import { hostname } from 'os'
import t from 'tap'
import fastifyDebugHeaders from '../src'

type Test = typeof t

let server: FastifyInstance | null
const servedBy = hostname()

async function buildServer(options?: FastifyPluginOptions): Promise<FastifyInstance> {
  if (server) {
    await server.close()
    server = null
  }

  server = fastify()

  server.register(fastifyDebugHeaders, options)

  server.get('/main', {
    handler(_: FastifyRequest, reply: FastifyReply): void {
      reply.send('OK')
    }
  })

  await server.listen(0)

  return server
}

t.test('Plugin', (t: Test) => {
  t.afterEach(async () => {
    await server!.close()
  })

  t.test('should correctly return all headers by default', async (t: Test) => {
    await buildServer()

    const response = await server!.inject({ method: 'GET', url: '/main' })

    t.equal(response.statusCode, 200)
    t.match(response.headers['content-type'], /^text\/plain/)
    t.equal(response.payload, 'OK')

    t.equal(response.headers['x-fastify-served-by'], servedBy)
    t.match(response.headers['x-fastify-request-id'], /^\d+$/)
    t.match(response.headers['x-fastify-response-time'], /^\d+\.\d{6} ms$/)
  })

  t.test('should correctly use the custom prefix', async (t: Test) => {
    await buildServer({ prefix: 'prefix' })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    t.equal(response.statusCode, 200)
    t.match(response.headers['content-type'], /^text\/plain/)
    t.equal(response.payload, 'OK')

    t.equal(response.headers['x-prefix-served-by'], servedBy)
    t.match(response.headers['x-prefix-request-id'], /^\d+$/)
    t.match(response.headers['x-prefix-response-time'], /^\d+\.\d{6} ms$/)
  })

  t.test('should not include the servedBy if requested to', async (t: Test) => {
    await buildServer({ servedBy: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    t.equal(response.statusCode, 200)
    t.match(response.headers['content-type'], /^text\/plain/)
    t.equal(response.payload, 'OK')

    t.doesNotHave(response.headers, 'x-fastify-served-by')
  })

  t.test('should not include the requestId if requested to', async (t: Test) => {
    await buildServer({ requestId: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    t.equal(response.statusCode, 200)
    t.match(response.headers['content-type'], /^text\/plain/)
    t.equal(response.payload, 'OK')

    t.doesNotHave(response.headers, 'x-fastify-request-id')
  })

  t.test('should not include the responseTime if requested to', async (t: Test) => {
    await buildServer({ responseTime: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    t.equal(response.statusCode, 200)
    t.match(response.headers['content-type'], /^text\/plain/)
    t.equal(response.payload, 'OK')

    t.doesNotHave(response.headers, 'x-fastify-response-time')
  })

  t.test('should be able to exclude all headers', async (t: Test) => {
    await buildServer({ servedBy: false, requestId: false, responseTime: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    t.equal(response.statusCode, 200)
    t.match(response.headers['content-type'], /^text\/plain/)
    t.equal(response.payload, 'OK')

    t.doesNotHave(response.headers, 'x-fastify-served-by')
    t.doesNotHave(response.headers, 'x-fastify-request-id')
    t.doesNotHave(response.headers, 'x-fastify-response-time')
  })

  t.end()
})
