/// <reference types="node" />
import { FastifyPluginOptions } from 'fastify';
declare const kStartTime: unique symbol;
declare module 'fastify' {
    interface FastifyRequest {
        [kStartTime]: bigint;
    }
}
declare const plugin: import("fastify").FastifyPluginCallback<FastifyPluginOptions, import("http").Server>;
export default plugin;
