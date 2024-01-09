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
exports.makeGrpc = exports.findReleaseFromManifest = exports.installGrpcVersion = exports.cacheGrpcInstallation = exports.restoreGrpcInstallation = void 0;
const cache = __importStar(require("@actions/cache"));
const core_1 = require("@actions/core");
const isNil_1 = __importDefault(require("lodash/isNil"));
const exec_1 = require("@actions/exec");
const io_1 = require("@actions/io");
const tool_cache_1 = require("@actions/tool-cache");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const INSTALLATION_CACHE_KEY = 'grpc-setup';
const TOKEN = (0, core_1.getInput)('token');
const AUTH = `token ${TOKEN}`;
const MANIFEST_REPO_OWNER = 'eWaterCycle';
const MANIFEST_REPO_NAME = 'grpc-versions';
const MANIFEST_REPO_BRANCH = 'main';
function addEnvPath(name, value) {
    if (name in process.env) {
        (0, core_1.exportVariable)(name, `${process.env[name]}${path_1.default.delimiter}${value}`);
    }
    else {
        (0, core_1.exportVariable)(name, value);
    }
}
function restoreGrpcInstallation(versionSpec) {
    return __awaiter(this, void 0, void 0, function* () {
        const installationPath = process.env.CMAKE_PREFIX_PATH;
        if (!(0, isNil_1.default)(installationPath)) {
            const versionCacheKey = `${INSTALLATION_CACHE_KEY}-${versionSpec}`;
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
function cacheGrpcInstallation(versionSpec) {
    return __awaiter(this, void 0, void 0, function* () {
        const installationPath = process.env.CMAKE_PREFIX_PATH;
        if (!(0, isNil_1.default)(installationPath)) {
            const versionCacheKey = `${INSTALLATION_CACHE_KEY}-${versionSpec}`;
            const cacheId = yield cache.saveCache([installationPath], versionCacheKey);
            (0, core_1.info)(`Cached grpc installation @ ${installationPath}`);
            (0, core_1.info)(`Cache ID: ${cacheId}`);
        }
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
        const extPath = 'grpc';
        (0, core_1.info)(`Configuring in ${extPath}`);
        const buildDir = path_1.default.join(extPath, 'build');
        yield (0, io_1.mkdirP)(buildDir);
        const hostedtoolcache = process.env.AGENT_TOOLSDIRECTORY;
        const prefixDir = path_1.default.join(hostedtoolcache, 'grpc', versionSpec);
        yield (0, exec_1.exec)('cmake', [
            '-DgRPC_INSTALL=ON',
            '-DgRPC_SSL_PROVIDER=package',
            '-DgRPC_BUILD_TESTS=OFF',
            '-DBUILD_SHARED_LIBS=ON',
            `-DCMAKE_INSTALL_PREFIX=${prefixDir}`,
            '..',
        ], { cwd: buildDir });
        (0, core_1.info)(`Compiling in ${buildDir}`);
        const jn = (0, os_1.cpus)().length.toString();
        yield (0, exec_1.exec)('make', ['-j', jn], { cwd: buildDir });
        (0, core_1.info)(`Installing to ${prefixDir}`);
        yield (0, exec_1.exec)('make install', [], { cwd: buildDir });
        return prefixDir;
    });
}
exports.installGrpcVersion = installGrpcVersion;
function findReleaseFromManifest(semanticVersionSpec, architecture) {
    return __awaiter(this, void 0, void 0, function* () {
        const manifest = yield (0, tool_cache_1.getManifestFromRepo)(MANIFEST_REPO_OWNER, MANIFEST_REPO_NAME, AUTH, MANIFEST_REPO_BRANCH);
        return (0, tool_cache_1.findFromManifest)(semanticVersionSpec, true, manifest, architecture);
    });
}
exports.findReleaseFromManifest = findReleaseFromManifest;
function makeGrpc(versionSpec) {
    return __awaiter(this, void 0, void 0, function* () {
        let installDir = (0, tool_cache_1.find)('grpc', versionSpec);
        if (installDir) {
            (0, core_1.info)(`Found in cache @ ${installDir}`);
        }
        else {
            (0, core_1.info)(`Version ${versionSpec} was not found in the local cache`);
            const foundRelease = yield findReleaseFromManifest(versionSpec, (0, os_1.arch)());
            if (foundRelease && foundRelease.files.length > 0) {
                (0, core_1.info)(`Version ${versionSpec} is available for downloading`);
                const downloadUrl = foundRelease.files[0].download_url;
                (0, core_1.info)(`Download from "${downloadUrl}"`);
                const archive = yield (0, tool_cache_1.downloadTool)(downloadUrl, undefined, AUTH);
                (0, core_1.info)('Extract downloaded archive');
                const extPath = yield (0, tool_cache_1.extractTar)(archive);
                (0, core_1.info)('Adding to the cache ...');
                installDir = yield (0, tool_cache_1.cacheDir)(extPath, 'grpc', versionSpec);
                (0, core_1.info)(`Successfully cached grpc to ${installDir}`);
            }
            else {
                (0, core_1.info)('Unable to download binary, falling back to compiling grpc');
                installDir = yield installGrpcVersion(versionSpec);
            }
        }
        (0, core_1.addPath)(path_1.default.join(installDir, 'bin'));
        (0, core_1.exportVariable)('GRPC_ROOT', installDir);
        addEnvPath('CMAKE_PREFIX_PATH', installDir);
        addEnvPath('LD_LIBRARY_PATH', path_1.default.join(installDir, 'lib'));
    });
}
exports.makeGrpc = makeGrpc;
