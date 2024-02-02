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
exports.makeGrpc = exports.installGrpcVersion = exports.cacheGrpcInstallation = exports.restoreGrpcInstallation = exports.addEnvPath = exports.INPUT_INSTALLATION_PATH = exports.INPUT_GRPC_VERSION = exports.INSTALLATION_CACHE_KEY = void 0;
const cache = __importStar(require("@actions/cache"));
const core_1 = require("@actions/core");
const isNil_1 = __importDefault(require("lodash/isNil"));
const exec_1 = require("@actions/exec");
const io_1 = require("@actions/io");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
exports.INSTALLATION_CACHE_KEY = 'grpc-setup';
exports.INPUT_GRPC_VERSION = 'grpc-version';
exports.INPUT_INSTALLATION_PATH = 'grpc-installation-path';
function addEnvPath(name, value) {
    if (name in process.env) {
        (0, core_1.exportVariable)(name, `${process.env[name]}${path_1.default.delimiter}${value}`);
    }
    else {
        (0, core_1.exportVariable)(name, value);
    }
}
exports.addEnvPath = addEnvPath;
function restoreGrpcInstallation(versionSpec, installationPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(0, isNil_1.default)(installationPath)) {
            const versionCacheKey = `${exports.INSTALLATION_CACHE_KEY}-${versionSpec}`;
            const cacheKey = yield cache.restoreCache([installationPath], versionCacheKey);
            if (!(0, isNil_1.default)(cacheKey)) {
                (0, core_1.info)(`Found grpc installation in cache @ ${installationPath}`);
                return true;
            }
        }
        return false;
    });
}
exports.restoreGrpcInstallation = restoreGrpcInstallation;
function cacheGrpcInstallation(versionSpec, installationPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const versionCacheKey = `${exports.INSTALLATION_CACHE_KEY}-${versionSpec}`;
        const cacheId = yield cache.saveCache([installationPath], versionCacheKey);
        (0, core_1.info)(`Cached grpc installation @ ${installationPath}`);
        (0, core_1.info)(`Cache ID: ${cacheId}`);
    });
}
exports.cacheGrpcInstallation = cacheGrpcInstallation;
function installGrpcVersion(versionSpec) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, core_1.info)('Cloning grpc repo...');
        yield (0, exec_1.exec)('git', [
            'clone',
            '--depth',
            '1',
            '--recurse-submodules',
            '--shallow-submodules',
            '-b',
            'v' + versionSpec,
            'https://github.com/grpc/grpc',
        ]);
    });
}
exports.installGrpcVersion = installGrpcVersion;
function makeGrpc(grpcInstallationPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const extPath = 'grpc';
        (0, core_1.info)(`Configuring in ${extPath}`);
        const buildDir = path_1.default.join(extPath, 'build');
        const grpcLocalPath = path_1.default.join(grpcInstallationPath, '.local');
        yield (0, io_1.mkdirP)(buildDir);
        (0, core_1.debug)('Starting cmake...');
        yield (0, exec_1.exec)('pwd');
        yield (0, exec_1.exec)('cd build');
        try {
            yield (0, io_1.mkdirP)(grpcInstallationPath);
            yield (0, io_1.mkdirP)(grpcLocalPath);
        }
        catch (e) {
            console.log('Folder alreay exist');
            console.log(e);
        }
        yield (0, exec_1.exec)('cmake', [
            '-DgRPC_INSTALL=ON',
            '-DgRPC_BUILD_TESTS=OFF',
            `-DCMAKE_INSTALL_PREFIX="${grpcLocalPath}"`,
            '-DBUILD_SHARED_LIBS=ON',
            '../..',
        ], { cwd: buildDir });
        (0, core_1.info)(`Compiling in ${buildDir}`);
        const jn = (0, os_1.cpus)().length.toString();
        yield (0, exec_1.exec)('make', ['-j', jn], { cwd: buildDir });
        (0, core_1.info)(`Installing to ${grpcInstallationPath}`);
        yield (0, exec_1.exec)(`sudo cmake`, ['--install', '.', '--prefix', grpcInstallationPath], {
            cwd: buildDir,
        });
        yield (0, exec_1.exec)(`make`, [], {
            cwd: buildDir,
        });
    });
}
exports.makeGrpc = makeGrpc;
