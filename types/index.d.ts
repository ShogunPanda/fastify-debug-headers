/// <reference types="node" />
import { FastifyInstance, RegisterOptions } from 'fastify';
import { IncomingMessage, Server as HttpServer, ServerResponse } from 'http';
import { Http2Server, Http2ServerRequest, Http2ServerResponse } from 'http2';
import { Server as HttpsServer } from 'https';
export interface Options<S extends HttpServer | HttpsServer | Http2Server = HttpServer, I extends IncomingMessage | Http2ServerRequest = IncomingMessage, R extends ServerResponse | Http2ServerResponse = ServerResponse> extends RegisterOptions<S, I, R> {
    servedBy?: boolean;
    responseTime?: boolean;
    requestId?: boolean;
    prefix?: string;
}
export interface Plugin<S extends HttpServer | HttpsServer | Http2Server = HttpServer, I extends IncomingMessage | Http2ServerRequest = IncomingMessage, R extends ServerResponse | Http2ServerResponse = ServerResponse> {
    (fastify: FastifyInstance<S, I, R>, options: Options<S, I, R>): void;
}
declare const _default: Plugin<HttpServer, IncomingMessage, ServerResponse>;
export default _default;
