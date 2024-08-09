"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketConfig = exports.detectEnvironment = void 0;
function detectEnvironment() {
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        return 'react-native';
    }
    if (typeof window !== 'undefined') {
        return 'browser';
    }
    return 'node';
}
exports.detectEnvironment = detectEnvironment;
function getSocketConfig(type) {
    if (type === 'node') {
        const { connect: connectNet } = require('net');
        const { connect: connectTLS } = require('tls');
        return {
            connectNet,
            connectTLS,
        };
    }
    const sockets = require('react-native-tcp-socket');
    return {
        connectNet: sockets.connect,
        connectTLS: sockets.connectTLS,
    };
}
exports.getSocketConfig = getSocketConfig;
