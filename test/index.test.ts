import fastify, {
  type FastifyInstance,
  type FastifyPluginOptions,
  type FastifyReply,
  type FastifyRequest
} from 'fastify'
import { deepStrictEqual, match } from 'node:assert'
import { hostname } from 'node:os'
import { afterEach, test } from 'node:test'
import fastifyDebugHeaders from '../src/index.ts'

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

  await server.listen({ port: 0 })

  return server
}

test('Plugin', async () => {
  afterEach(async () => {
    await server!.close()
  })

  await test('should correctly return all headers by default', async () => {
    await buildServer()

    const response = await server!.inject({ method: 'GET', url: '/main' })

    deepStrictEqual(response.statusCode, 200)
    match(response.headers['content-type'] as string, /^text\/plain/)
    deepStrictEqual(response.payload, 'OK')

    deepStrictEqual(response.headers['x-fastify-served-by'], servedBy)
    match(response.headers['x-fastify-request-id'] as string, /\d+$/)
    match(response.headers['x-fastify-response-time'] as string, /^\d+\.\d{6} ms$/)
  })

  await test('should correctly use the custom prefix', async () => {
    await buildServer({ prefix: 'prefix' })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    deepStrictEqual(response.statusCode, 200)
    match(response.headers['content-type'] as string, /^text\/plain/)
    deepStrictEqual(response.payload, 'OK')

    deepStrictEqual(response.headers['x-prefix-served-by'], servedBy)
    match(response.headers['x-prefix-request-id'] as string, /\d+$/)
    match(response.headers['x-prefix-response-time'] as string, /^\d+\.\d{6} ms$/)
  })

  await test('should not include the servedBy if requested to', async () => {
    await buildServer({ servedBy: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    deepStrictEqual(response.statusCode, 200)
    match(response.headers['content-type'] as string, /^text\/plain/)
    deepStrictEqual(response.payload, 'OK')

    deepStrictEqual(typeof response.headers['x-fastify-served-by'], 'undefined')
  })

  await test('should not include the requestId if requested to', async () => {
    await buildServer({ requestId: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    deepStrictEqual(response.statusCode, 200)
    match(response.headers['content-type'] as string, /^text\/plain/)
    deepStrictEqual(response.payload, 'OK')

    deepStrictEqual(typeof response.headers['x-fastify-request-id'], 'undefined')
  })

  await test('should not include the responseTime if requested to', async () => {
    await buildServer({ responseTime: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    deepStrictEqual(response.statusCode, 200)
    match(response.headers['content-type'] as string, /^text\/plain/)
    deepStrictEqual(response.payload, 'OK')

    deepStrictEqual(typeof response.headers['x-fastify-response-time'], 'undefined')
  })

  await test('should be able to exclude all headers', async () => {
    await buildServer({ servedBy: false, requestId: false, responseTime: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    deepStrictEqual(response.statusCode, 200)
    match(response.headers['content-type'] as string, /^text\/plain/)
    deepStrictEqual(response.payload, 'OK')

    deepStrictEqual(typeof response.headers['x-fastify-served-by'], 'undefined')
    deepStrictEqual(typeof response.headers['x-fastify-request-id'], 'undefined')
    deepStrictEqual(typeof response.headers['x-fastify-response-time'], 'undefined')
  })
})
