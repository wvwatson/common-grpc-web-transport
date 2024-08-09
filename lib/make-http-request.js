"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeHttpRequest = void 0;
/**
 * Creates an HTTP request & sends it over a socket
 */
function makeHttpRequest({ secure, method, path, host, port, logger, headers, connectNet, connectTLS }) {
    const defaultPort = secure ? 443 : 80;
    const lines = [
        `${method} ${path} HTTP/1.1`,
        `Host: ${host}`,
    ];
    // import here to avoid bundling http-parser-js in the browser
    const { HTTPParser } = require('http-parser-js');
    const resParser = new HTTPParser(HTTPParser.RESPONSE);
    const connect = secure ? connectTLS : connectNet;
    const netSocket = connect({
        host: host,
        port: port ? +port : defaultPort,
        noDelay: true,
        keepAlive: true,
    }, () => { });
    netSocket.setTimeout(10000);
    netSocket.on('connect', onConnect);
    logger === null || logger === void 0 ? void 0 : logger.trace(`connecting over ${secure ? 'tls' : 'tcp'}`);
    let pendingWrites = [];
    let pendingEnd = false;
    let sentInit = false;
    let sentContentLengthHeader = false;
    let state = 'connecting';
    for (const key in headers) {
        writeHeader(key, `${headers[key]}`);
    }
    resParser.onBody = (chunk, offset, length) => {
        chunk = chunk.subarray(offset, offset + length);
        netSocket.emit('data-http', chunk);
    };
    resParser.onHeadersComplete = (info) => {
        const headers = {};
        for (let i = 0; i < info.headers.length; i += 2) {
            headers[info.headers[i].toString()] =
                info.headers[i + 1].toString();
        }
        logger === null || logger === void 0 ? void 0 : logger.trace({ statusCode: info.statusCode, headers }, 'recv headers');
        netSocket.emit('headers', info.statusCode, headers);
    };
    resParser.onMessageComplete = () => {
        logger === null || logger === void 0 ? void 0 : logger.trace('http request complete');
        handleSocketEnd();
    };
    netSocket.on('data', data => {
        logger === null || logger === void 0 ? void 0 : logger.trace({ data: data.toString() }, 'recv raw data');
        resParser.execute(data);
    });
    netSocket.on('error', (err) => {
        logger === null || logger === void 0 ? void 0 : logger.trace({ err }, 'socket error');
        handleSocketEnd();
    });
    return {
        onError(callback) {
            netSocket.on('error', callback);
        },
        onHeaders(callback) {
            netSocket.on('headers', callback);
        },
        onData(callback) {
            netSocket.on('data-http', callback);
        },
        onEnd(callback) {
            netSocket.on('end-http', callback);
        },
        end() {
            if (state === 'connecting') {
                logger === null || logger === void 0 ? void 0 : logger.trace('pending end');
                pendingEnd = true;
            }
            else if (state === 'connected') {
                netSocket.end();
            }
        },
        destroy() {
            netSocket.destroy();
        },
        write,
        writeHeader,
        finishWrite,
    };
    function handleSocketEnd() {
        state = 'closed';
        netSocket.emit('end-http');
        netSocket.end();
    }
    function write(content) {
        if (!sentContentLengthHeader) {
            writeHeader('Transfer-Encoding', 'chunked');
        }
        if (!sentInit) {
            const initData = lines.join('\r\n') + '\r\n\r\n';
            logger === null || logger === void 0 ? void 0 : logger.trace({ initData }, 'sent init data');
            writeToSocket(initData);
            sentInit = true;
        }
        if (!sentContentLengthHeader) {
            writeToSocket(`${content.length.toString(16)}\r\n`);
        }
        writeToSocket(content);
        if (!sentContentLengthHeader) {
            writeToSocket('\r\n');
        }
    }
    function finishWrite() {
        if (!sentContentLengthHeader) {
            writeToSocket('0\r\n\r\n');
        }
    }
    function writeHeader(key, value) {
        if (sentInit) {
            throw new Error('Cannot write header after init');
        }
        if (key.toLowerCase() === 'content-length') {
            sentContentLengthHeader = true;
        }
        lines.push(`${key}: ${value}`);
    }
    function writeToSocket(buff) {
        if (state === 'closed') {
            throw new Error('Socket is closed');
        }
        if (state === 'connected') {
            netSocket.write(buff);
        }
        else {
            pendingWrites.push(buff);
        }
    }
    function onConnect() {
        logger === null || logger === void 0 ? void 0 : logger.trace({ host, port }, 'connected');
        state = 'connected';
        for (let i = 0; i < pendingWrites.length; i++) {
            netSocket.write(pendingWrites[i]);
        }
        pendingWrites = [];
        if (pendingEnd) {
            state = 'closed';
        }
    }
}
exports.makeHttpRequest = makeHttpRequest;
