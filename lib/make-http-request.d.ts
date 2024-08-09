/// <reference types="node" />
/// <reference types="node" />
import type * as http from 'http';
import type { Logger, SocketConfig } from './types';
export type HTTPRequest = ReturnType<typeof makeHttpRequest>;
type MakeHTTPRequestOptions = http.RequestOptions & {
    /** Whether to use TLS or not */
    secure: boolean;
    logger?: Logger;
} & SocketConfig;
/**
 * Creates an HTTP request & sends it over a socket
 */
export declare function makeHttpRequest({ secure, method, path, host, port, logger, headers, connectNet, connectTLS }: MakeHTTPRequestOptions): {
    onError(callback: (err: Error) => void): void;
    onHeaders(callback: (statusCode: number, headers: {
        [_: string]: string | string[];
    }) => void): void;
    onData(callback: (buff: Buffer) => void): void;
    onEnd(callback: () => void): void;
    end(): void;
    destroy(): void;
    write: (content: Uint8Array | string) => void;
    writeHeader: (key: string, value: string) => void;
    finishWrite: () => void;
};
export {};
