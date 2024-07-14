"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDepCache = exports.restoreDepCache = exports.parseBooleanInput = exports.addEnvPath = void 0;
const cache = __importStar(require("@actions/cache"));
const core_1 = require("@actions/core");
const isNil_1 = __importDefault(require("lodash/isNil"));
const path_1 = __importDefault(require("path"));
const consts_1 = require("./consts");
function addEnvPath(name, value) {
    if (name in process.env) {
        (0, core_1.exportVariable)(name, `${process.env[name]}${path_1.default.delimiter}${value}`);
    }
    else {
        (0, core_1.exportVariable)(name, value);
    }
}
exports.addEnvPath = addEnvPath;
function parseBooleanInput(input) {
    if (input === 'true') {
        return true;
    }
    return false;
}
exports.parseBooleanInput = parseBooleanInput;
function restoreDepCache(installationPath, grpcVersion, shouldIncludeGoogleTest, googleTestVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(0, isNil_1.default)(installationPath)) {
            const versionCacheKey = `${consts_1.INSTALLATION_CACHE_KEY}-${shouldIncludeGoogleTest}-${googleTestVersion}-${grpcVersion}`;
            const cacheKey = yield cache.restoreCache([installationPath], versionCacheKey);
            if (!(0, isNil_1.default)(cacheKey)) {
                (0, core_1.info)(`Found grpc installation in cache @ ${installationPath}`);
                return true;
            }
        }
        return false;
    });
}
exports.restoreDepCache = restoreDepCache;
function createDepCache(installationPath, grpcVersion, shouldIncludeGoogleTest, googleTestVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        const versionCacheKey = `${consts_1.INSTALLATION_CACHE_KEY}-${shouldIncludeGoogleTest}-${googleTestVersion}-${grpcVersion}`;
        const cacheId = yield cache.saveCache([installationPath], versionCacheKey);
        (0, core_1.info)(`Cached grpc installation @ ${installationPath}`);
        (0, core_1.info)(`versionCacheKey : ${versionCacheKey}`);
        (0, core_1.info)(`Cache ID: ${cacheId}`);
    });
}
exports.createDepCache = createDepCache;
