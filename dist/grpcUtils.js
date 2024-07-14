"use strict";
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
exports.buildGrpc = exports.makeBuildGrpc = exports.cloneGrpcRepo = void 0;
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
const io_1 = require("@actions/io");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
function cloneGrpcRepo(versionSpec) {
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
exports.cloneGrpcRepo = cloneGrpcRepo;
function makeBuildGrpc(grpcInstallationPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const extPath = 'grpc';
        (0, core_1.info)(`Configuring in ${extPath}`);
        const buildDir = path_1.default.join(extPath, 'build');
        yield (0, io_1.mkdirP)(buildDir);
        yield (0, exec_1.exec)('cmake', [
            '-DgRPC_INSTALL=ON',
            '-DgRPC_BUILD_TESTS=OFF',
            `-DCMAKE_INSTALL_PREFIX=${grpcInstallationPath}`,
            '-DBUILD_SHARED_LIBS=ON',
            '..',
        ], { cwd: buildDir });
        (0, core_1.info)(`Compiling in ${buildDir}`);
        const jn = (0, os_1.cpus)().length.toString();
        yield (0, exec_1.exec)('make', ['-j', jn], { cwd: buildDir });
        yield (0, exec_1.exec)(`make install`, [], {
            cwd: buildDir,
        });
    });
}
exports.makeBuildGrpc = makeBuildGrpc;
function buildGrpc(binPath, grpcVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, core_1.info)(`Setup grpc version spec ${grpcVersion}`);
        (0, core_1.info)(`Cloning gRPC repo with tag ${grpcVersion}`);
        yield cloneGrpcRepo(grpcVersion);
        (0, core_1.info)(`Make gRPC binaries ${grpcVersion}`);
        yield makeBuildGrpc(binPath);
    });
}
exports.buildGrpc = buildGrpc;
