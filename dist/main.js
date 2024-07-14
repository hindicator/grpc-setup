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
exports.run = void 0;
const core_1 = require("@actions/core");
const utils_1 = require("./utils");
const path_1 = __importDefault(require("path"));
const io_1 = require("@actions/io");
const consts_1 = require("./consts");
const grpcUtils_1 = require("./grpcUtils");
const googleTestUtils_1 = require("./googleTestUtils");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const grpcVersionSpec = (0, core_1.getInput)(consts_1.INPUT_GRPC_VERSION);
        const installationPath = (0, core_1.getInput)(consts_1.INPUT_INSTALLATION_PATH);
        const shouldIncludeGoogleTest = (0, utils_1.parseBooleanInput)((0, core_1.getInput)(consts_1.INPUT_INCLUDE_GOOGLE_TEST));
        const binPath = `${process.env.GITHUB_WORKSPACE}/cache/${installationPath}`;
        (0, core_1.info)(`Setting dependencies in ${binPath}`);
        const isInstallationCached = yield (0, utils_1.restoreDepCache)(grpcVersionSpec, binPath, shouldIncludeGoogleTest);
        if (!isInstallationCached) {
            (0, core_1.info)(`Setup dependencies to cache`);
            yield (0, io_1.mkdirP)(binPath);
            yield (0, grpcUtils_1.buildGrpc)(binPath, grpcVersionSpec);
            if (shouldIncludeGoogleTest) {
                yield (0, googleTestUtils_1.buildGoogleTest)(binPath);
            }
            yield (0, utils_1.createDepCache)(grpcVersionSpec, binPath, shouldIncludeGoogleTest);
        }
        // Setting env variables
        (0, core_1.addPath)(path_1.default.join(binPath, 'bin'));
        (0, core_1.exportVariable)('GRPC_ROOT', binPath);
        (0, utils_1.addEnvPath)('CMAKE_PREFIX_PATH', binPath);
        (0, utils_1.addEnvPath)('LD_LIBRARY_PATH', path_1.default.join(binPath, 'lib'));
        (0, core_1.info)(`Successfully setup grpc version ${grpcVersionSpec}`);
    });
}
exports.run = run;
