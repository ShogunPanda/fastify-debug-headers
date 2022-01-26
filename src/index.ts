import { FastifyError, FastifyInstance, FastifyPluginOptions } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { hostname } from 'os'

const kStartTime = Symbol('fastify-debug-headers.start-time')

declare module 'fastify' {
  interface FastifyRequest {
    [kStartTime]: bigint
  }
}

export const plugin = fastifyPlugin(
  function (instance: FastifyInstance, options: FastifyPluginOptions, done: (error?: FastifyError) => void): void {
    const servedBy = options.servedBy ?? true
    const responseTime = options.responseTime ?? true
    const requestId = options.requestId ?? true

    const prefix = options.prefix ?? 'Fastify'
    const servedByName = hostname()

    if (responseTime) {
      instance.decorateRequest(kStartTime, 0)

      instance.addHook('onRequest', (request, _, done) => {
        request[kStartTime] = process.hrtime.bigint()

        done()
      })
    }

    if (servedBy || requestId || responseTime) {
      instance.addHook('onSend', (request, reply, _, done) => {
        if (requestId) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          reply.header(`X-${prefix}-Request-Id`, request.id.toString())
        }

        if (servedBy) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          reply.header(`X-${prefix}-Served-By`, servedByName)
        }

        if (responseTime) {
          const duration = process.hrtime.bigint() - request[kStartTime]

          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          reply.header(`X-${prefix}-Response-Time`, `${(Number(duration) / 1e6).toFixed(6)} ms`)
        }

        done()
      })
    }

    done()
  },
  { name: 'fastify-debug-headers', fastify: '3.x' }
)

export default plugin
