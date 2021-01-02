/// <reference types="node" />
declare const kStartTime: unique symbol;
declare module 'fastify' {
    interface FastifyRequest {
        [kStartTime]: bigint;
    }
}
declare const plugin: import("fastify").FastifyPluginCallback<Record<string, any>, import("http").Server>;
export default plugin;
