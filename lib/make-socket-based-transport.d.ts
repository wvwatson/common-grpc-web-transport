import { grpc } from '@improbable-eng/grpc-web';
import type { SocketConfig } from './types';
export declare function makeSocketBasedTransport(options: grpc.TransportOptions, config: SocketConfig): grpc.Transport;
