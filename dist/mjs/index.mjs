import fastifyPlugin from 'fastify-plugin';
import { hostname } from 'os';
const kStartTime = Symbol('fastify-debug-headers.start-time');
const plugin = fastifyPlugin(function (instance, options, done) {
    var _a, _b, _c, _d;
    const servedBy = (_a = options.servedBy) !== null && _a !== void 0 ? _a : true;
    const responseTime = (_b = options.responseTime) !== null && _b !== void 0 ? _b : true;
    const requestId = (_c = options.requestId) !== null && _c !== void 0 ? _c : true;
    const prefix = (_d = options.prefix) !== null && _d !== void 0 ? _d : 'Fastify';
    const servedByName = hostname();
    if (responseTime) {
        instance.decorateRequest(kStartTime, 0);
        instance.addHook('onRequest', async function (request) {
            request[kStartTime] = process.hrtime.bigint();
        });
    }
    if (servedBy || requestId || responseTime) {
        instance.addHook('onSend', async (request, reply) => {
            if (requestId) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                reply.header(`X-${prefix}-Request-Id`, request.id.toString());
            }
            if (servedBy) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                reply.header(`X-${prefix}-Served-By`, servedByName);
            }
            if (responseTime) {
                const duration = process.hrtime.bigint() - request[kStartTime];
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                reply.header(`X-${prefix}-Response-Time`, `${(Number(duration) / 1e6).toFixed(6)} ms`);
            }
        });
    }
    done();
}, { name: 'fastify-debug-headers', fastify: '3.x' });
export default plugin;
// Fix CommonJS exporting
/* istanbul ignore else */
if (typeof module !== 'undefined') {
    module.exports = plugin;
    Object.assign(module.exports, exports);
}
