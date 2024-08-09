import type { SocketConfig, TransportType } from './types';
export declare function detectEnvironment(): TransportType;
export declare function getSocketConfig(type: Exclude<TransportType, 'browser'>): SocketConfig;
