"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSocketBasedTransport = void 0;
const grpc_web_1 = require("@improbable-eng/grpc-web");
const make_http_request_1 = require("./make-http-request");
function makeSocketBasedTransport(options, config) {
    var _a;
    const parsedUrl = new URL(options.url);
    let request;
    const logger = (_a = config.logger) === null || _a === void 0 ? void 0 : _a.child({
        rpc: options.methodDefinition.methodName,
        id: generateRequestId()
    });
    return {
        sendMessage(msgBytes) {
            if (!options.methodDefinition.requestStream
                && !options.methodDefinition.responseStream) {
                logger === null || logger === void 0 ? void 0 : logger.trace({ length: msgBytes.byteLength }, 'set content length');
                // Disable chunked encoding if we are not using streams
                request.writeHeader('Content-Length', msgBytes.byteLength.toString());
            }
            request.write(msgBytes);
        },
        finishSend() {
            logger === null || logger === void 0 ? void 0 : logger.trace('finished write');
            request.finishWrite();
            request.end();
        },
        start(metadata) {
            const headers = {};
            metadata.forEach((key, values) => {
                headers[key] = values.join(', ');
            });
            request = (0, make_http_request_1.makeHttpRequest)({
                host: parsedUrl.hostname,
                port: parsedUrl.port ? +parsedUrl.port : undefined,
                path: parsedUrl.pathname,
                headers: headers,
                method: 'POST',
                secure: parsedUrl.protocol === 'https:',
                ...config,
                logger,
            });
            request.onError(err => {
                logger === null || logger === void 0 ? void 0 : logger.error({ err }, 'error in request');
                options.onEnd(err);
            });
            request.onHeaders((statusCode, _headers) => {
                const headers = filterHeadersForUndefined(_headers);
                options.onHeaders(new grpc_web_1.grpc.Metadata(headers), statusCode);
            });
            request.onData(chunk => {
                logger === null || logger === void 0 ? void 0 : logger.trace({ chunk: chunk.toString() }, 'received chunk');
                options.onChunk(chunk);
            });
            request.onEnd(() => {
                logger === null || logger === void 0 ? void 0 : logger.trace('request ended');
                options.onEnd();
            });
        },
        cancel() {
            logger === null || logger === void 0 ? void 0 : logger.trace('canceling request');
            request === null || request === void 0 ? void 0 : request.destroy();
        }
    };
}
exports.makeSocketBasedTransport = makeSocketBasedTransport;
function filterHeadersForUndefined(headers) {
    const filteredHeaders = {};
    for (const key in headers) {
        const value = headers[key];
        if (headers.hasOwnProperty(key)) {
            if (value !== undefined) {
                filteredHeaders[key] = value;
            }
        }
    }
    return filteredHeaders;
}
function generateRequestId() {
    return Math.random().toString(16).replace('.', '');
}
