/// <reference types="node" />
import { FastifyInstance, RegisterOptions } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
declare const _default: (instance: FastifyInstance<Server, IncomingMessage, ServerResponse>, options: RegisterOptions<unknown, unknown, unknown>, callback: (err?: import("fastify").FastifyError | undefined) => void) => void;
export default _default;
