import fastify, { FastifyInstance, RegisterOptions } from 'fastify'
import { IncomingMessage, Server, ServerResponse } from 'http'
import { hostname } from 'os'
// @ts-ignore
import t from 'tap'
import fastifyDebugHeaders from '../src'

let server: FastifyInstance | null
const servedBy = hostname()

async function buildServer(
  options?: RegisterOptions<Server, IncomingMessage, ServerResponse>
): Promise<FastifyInstance> {
  if (server) {
    await server.close()
    server = null
  }

  server = fastify()

  server.register(fastifyDebugHeaders, options)

  server.get('/main', {
    async handler(): Promise<string> {
      return 'OK'
    }
  })

  await server.listen(0)

  return server
}

t.test('Plugin', async (t: any) => {
  t.afterEach(() => server!.close())

  t.test('should correctly return all headers by default', async (t: any) => {
    await buildServer()
    const response = await server!.inject({ method: 'GET', url: '/main' })

    t.equal(response.statusCode, 200)
    t.match(response.headers['content-type'], /^text\/plain/)
    t.equal(response.payload, 'OK')

    t.equal(response.headers['x-fastify-served-by'], servedBy)
    t.match(response.headers['x-fastify-request-id'], /^\d+$/)
    t.match(response.headers['x-fastify-response-time'], /^\d+\.\d{6} ms$/)
  })

  t.test('should correctly use the custom prefix', async (t: any) => {
    await buildServer({ prefix: 'prefix' })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    t.equal(response.statusCode, 200)
    t.match(response.headers['content-type'], /^text\/plain/)
    t.equal(response.payload, 'OK')

    t.equal(response.headers['x-prefix-served-by'], servedBy)
    t.match(response.headers['x-prefix-request-id'], /^\d+$/)
    t.match(response.headers['x-prefix-response-time'], /^\d+\.\d{6} ms$/)
  })

  t.test('should not include the servedBy if requested to', async (t: any) => {
    await buildServer({ servedBy: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    t.equal(response.statusCode, 200)
    t.match(response.headers['content-type'], /^text\/plain/)
    t.equal(response.payload, 'OK')

    t.doesNotHave(response.headers, 'x-fastify-served-by')
  })

  t.test('should not include the requestId if requested to', async (t: any) => {
    await buildServer({ requestId: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    t.equal(response.statusCode, 200)
    t.match(response.headers['content-type'], /^text\/plain/)
    t.equal(response.payload, 'OK')

    t.doesNotHave(response.headers, 'x-fastify-request-id')
  })

  t.test('should not include the responseTime if requested to', async (t: any) => {
    await buildServer({ responseTime: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    t.equal(response.statusCode, 200)
    t.match(response.headers['content-type'], /^text\/plain/)
    t.equal(response.payload, 'OK')

    t.doesNotHave(response.headers, 'x-fastify-response-time')
  })

  t.test('should be able to exclude all headers', async (t: any) => {
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
