"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const os_1 = require("os");
const kStartTime = Symbol('fastify-debug-headers.start-time');
exports.plugin = fastify_plugin_1.default(function (instance, options, done) {
    var _a, _b, _c, _d;
    const servedBy = (_a = options.servedBy, (_a !== null && _a !== void 0 ? _a : true));
    const responseTime = (_b = options.responseTime, (_b !== null && _b !== void 0 ? _b : true));
    const requestId = (_c = options.requestId, (_c !== null && _c !== void 0 ? _c : true));
    const prefix = (_d = options.prefix, (_d !== null && _d !== void 0 ? _d : 'Fastify'));
    const servedByName = os_1.hostname();
    if (responseTime) {
        instance.addHook('onRequest', async function (request) {
            request.req[kStartTime] = process.hrtime();
        });
    }
    if (servedBy || requestId || responseTime) {
        instance.addHook('onSend', async (request, reply) => {
            if (requestId) {
                reply.header(`X-${prefix}-Request-Id`, request.id.toString());
            }
            if (servedBy) {
                reply.header(`X-${prefix}-Served-By`, servedByName);
            }
            if (responseTime) {
                const hrDuration = process.hrtime(request.req[kStartTime]);
                reply.header(`X-${prefix}-Response-Time`, `${(hrDuration[0] * 1e3 + hrDuration[1] / 1e6).toFixed(6)} ms`);
            }
        });
    }
    done();
}, { name: 'fastify-debug-headers' });
module.exports = exports.plugin;
Object.assign(module.exports, exports);
