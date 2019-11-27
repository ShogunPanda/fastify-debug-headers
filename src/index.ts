import { FastifyInstance, FastifyReply, FastifyRequest, RegisterOptions } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { IncomingMessage, Server, ServerResponse } from 'http'
import { hostname } from 'os'

const kStartTime = Symbol('fastify-debug-headers.start-time')

interface DecoratedIncomingMessage extends IncomingMessage {
  [kStartTime]?: [number, number]
}

export default fastifyPlugin(
  function<S = Server, I = IncomingMessage, R = ServerResponse>(
    instance: FastifyInstance,
    options: RegisterOptions<S, I, R>,
    done: () => void
  ): void {
    const servedBy = options.servedBy ?? true
    const responseTime = options.responseTime ?? true
    const requestId = options.requestId ?? true

    const prefix = options.prefix ?? 'Fastify'
    const servedByName = hostname()

    if (responseTime) {
      instance.addHook('onRequest', async function(request: FastifyRequest<DecoratedIncomingMessage>): Promise<void> {
        request.req[kStartTime] = process.hrtime()
      })
    }

    if (servedBy || requestId || responseTime) {
      instance.addHook(
        'onSend',
        async (request: FastifyRequest<DecoratedIncomingMessage>, reply: FastifyReply<ServerResponse>) => {
          if (requestId) {
            reply.header(`X-${prefix}-Request-Id`, request.id.toString())
          }

          if (servedBy) {
            reply.header(`X-${prefix}-Served-By`, servedByName)
          }

          if (responseTime) {
            const hrDuration = process.hrtime(request.req[kStartTime])
            reply.header(`X-${prefix}-Response-Time`, `${(hrDuration[0] * 1e3 + hrDuration[1] / 1e6).toFixed(6)} ms`)
          }
        }
      )
    }
    done()
  },
  { name: 'fastify-debug-headers' }
)
