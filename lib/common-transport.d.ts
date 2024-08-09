import { grpc } from '@improbable-eng/grpc-web';
import type { TransportConfig } from './types';
export declare function CommonTransport({ logger, type }: TransportConfig): grpc.TransportFactory;
