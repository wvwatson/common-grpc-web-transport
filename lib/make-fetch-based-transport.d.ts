import { grpc } from '@improbable-eng/grpc-web';
import { SocketConfig } from './types';
export declare function makeFetchBasedTransport({ url, methodDefinition: { methodName }, onEnd, onChunk, onHeaders, }: grpc.TransportOptions, { logger }: SocketConfig): grpc.Transport;
