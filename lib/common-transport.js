"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonTransport = void 0;
const grpc_web_1 = require("@improbable-eng/grpc-web");
const make_fetch_based_transport_1 = require("./make-fetch-based-transport");
const utils_1 = require("./utils");
function CommonTransport({ logger, type }) {
    if (!type) {
        type = (0, utils_1.detectEnvironment)();
        logger === null || logger === void 0 ? void 0 : logger.debug(`detected environment: ${type}`);
    }
    if (type === 'browser') {
        return grpc_web_1.grpc.XhrTransport({});
    }
    const config = (0, utils_1.getSocketConfig)(type);
    config.logger = logger;
    return opts => (0, make_fetch_based_transport_1.makeFetchBasedTransport)(opts, config);
}
exports.CommonTransport = CommonTransport;
