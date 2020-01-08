import fastify, { FastifyInstance, RegisterOptions } from 'fastify'
import { IncomingMessage, Server, ServerResponse } from 'http'
import 'jest-additional-expectations'
import { hostname } from 'os'
import { plugin as fastifyDebugHeaders } from '../src'

let server: FastifyInstance | null
const servedBy = hostname()

async function buildServer(
  options: RegisterOptions<Server, IncomingMessage, ServerResponse> = {}
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

describe('Plugin', function(): void {
  beforeEach(buildServer)
  afterEach(() => server!.close())

  it('should correctly return all headers by default', async function(): Promise<void> {
    const response = await server!.inject({ method: 'GET', url: '/main' })

    expect(response).toHaveHTTPStatus(200)
    expect(response).toBeText()
    expect(response.payload).toEqual('OK')

    expect(response.headers['x-fastify-served-by']).toEqual(servedBy)
    expect(response.headers['x-fastify-request-id']).toMatch(/^\d+$/)
    expect(response.headers['x-fastify-response-time']).toMatch(/^\d+\.\d{6} ms$/)
  })

  it('should correctly use the custom prefix', async function(): Promise<void> {
    await buildServer({ prefix: 'prefix' })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    expect(response).toHaveHTTPStatus(200)
    expect(response).toBeText()
    expect(response.payload).toEqual('OK')

    expect(response.headers['x-prefix-served-by']).toEqual(servedBy)
    expect(response.headers['x-prefix-request-id']).toMatch(/^\d+$/)
    expect(response.headers['x-prefix-response-time']).toMatch(/^\d+\.\d{6} ms$/)
  })

  it('should not include the servedBy if requested to', async function(): Promise<void> {
    await buildServer({ servedBy: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    expect(response).toHaveHTTPStatus(200)
    expect(response).toBeText()
    expect(response.payload).toEqual('OK')

    expect('x-fastify-served-by' in response.headers).toBeFalsy()
  })

  it('should not include the requestId if requested to', async function(): Promise<void> {
    await buildServer({ requestId: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    expect(response).toHaveHTTPStatus(200)
    expect(response).toBeText()
    expect(response.payload).toEqual('OK')

    expect('x-fastify-request-id' in response.headers).toBeFalsy()
  })

  it('should not include the responseTime if requested to', async function(): Promise<void> {
    await buildServer({ responseTime: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    expect(response).toHaveHTTPStatus(200)
    expect(response).toBeText()
    expect(response.payload).toEqual('OK')

    expect('x-fastify-response-time' in response.headers).toBeFalsy()
  })

  it('should be able to exclude all headers', async function(): Promise<void> {
    await buildServer({ servedBy: false, requestId: false, responseTime: false })

    const response = await server!.inject({ method: 'GET', url: '/main' })

    expect(response).toHaveHTTPStatus(200)
    expect(response).toBeText()
    expect(response.payload).toEqual('OK')

    expect('x-fastify-served-by' in response.headers).toBeFalsy()
    expect('x-fastify-request-id' in response.headers).toBeFalsy()
    expect('x-fastify-response-time' in response.headers).toBeFalsy()
  })
})
