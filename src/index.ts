import { FastifyInstance, FastifyReply, FastifyRequest, Plugin, RegisterOptions } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { IncomingMessage, Server as HttpServer, ServerResponse } from 'http'
import { Http2Server, Http2ServerRequest, Http2ServerResponse } from 'http2'
import { Server as HttpsServer } from 'https'
import { hostname } from 'os'

const kStartTime = Symbol('fastify-debug-headers.start-time')

type DecoratedIncomingMessage<I> = I & {
  [kStartTime]?: bigint
}

export interface Options<
  S extends HttpServer | HttpsServer | Http2Server = HttpServer,
  I extends IncomingMessage | Http2ServerRequest = IncomingMessage,
  R extends ServerResponse | Http2ServerResponse = ServerResponse
> extends RegisterOptions<S, I, R> {
  servedBy?: boolean
  responseTime?: boolean
  requestId?: boolean
  prefix?: string
}

function createPlugin<
  S extends HttpServer | HttpsServer | Http2Server = HttpServer,
  I extends IncomingMessage | Http2ServerRequest = IncomingMessage,
  R extends ServerResponse | Http2ServerResponse = ServerResponse
>(): Plugin<S, I, R, Options> {
  return fastifyPlugin(
    function(instance: FastifyInstance<S, I, R>, options: RegisterOptions<S, I, R>, done: () => void): void {
      const servedBy = options.servedBy ?? true
      const responseTime = options.responseTime ?? true
      const requestId = options.requestId ?? true

      const prefix = options.prefix ?? 'Fastify'
      const servedByName = hostname()

      if (responseTime) {
        instance.addHook('onRequest', async function(request: FastifyRequest<I>): Promise<void> {
          const decoratedRequest = request.req as DecoratedIncomingMessage<I>
          decoratedRequest[kStartTime] = process.hrtime.bigint()
        })
      }

      if (servedBy || requestId || responseTime) {
        instance.addHook('onSend', async (request: FastifyRequest<I>, reply: FastifyReply<R>) => {
          if (requestId) {
            reply.header(`X-${prefix}-Request-Id`, request.id.toString())
          }

          if (servedBy) {
            reply.header(`X-${prefix}-Served-By`, servedByName)
          }

          if (responseTime) {
            const duration = process.hrtime.bigint() - (request.req as DecoratedIncomingMessage<I>)[kStartTime]!
            reply.header(`X-${prefix}-Response-Time`, `${(Number(duration) * 1e6).toFixed(6)} ms`)
          }
        })
      }

      done()
    },
    { name: 'fastify-debug-headers' }
  )
}

export const plugin = createPlugin()

module.exports = plugin
Object.assign(module.exports, exports)
