/// <reference types="node" />
import { Plugin } from 'fastify';
import { IncomingMessage, Server as HttpServer, ServerResponse } from 'http';
import { Http2Server, Http2ServerResponse } from 'http2';
import { Server as HttpsServer } from 'https';
export interface Options {
    servedBy?: boolean;
    responseTime?: boolean;
    requestId?: boolean;
    prefix?: string;
}
export declare const plugin: Plugin<HttpServer | HttpsServer | Http2Server, IncomingMessage, ServerResponse | Http2ServerResponse, Options>;
