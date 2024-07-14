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
exports.buildGoogleTest = exports.makeBuildGoogleTest = exports.cloneGoogleTest = void 0;
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
const io_1 = require("@actions/io");
const path_1 = __importDefault(require("path"));
function cloneGoogleTest(versionSpec) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, core_1.info)('Cloning grpc repo...');
        yield (0, exec_1.exec)('git', [
            'clone',
            'https://github.com/google/googletest.git',
            '-b',
            'v' + versionSpec,
        ]);
    });
}
exports.cloneGoogleTest = cloneGoogleTest;
function makeBuildGoogleTest(binPath) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, core_1.info)(`Setup googletest binaries`);
        const extPath = 'googletest';
        const buildDir = path_1.default.join(extPath, 'build');
        yield (0, io_1.mkdirP)(buildDir);
        yield (0, exec_1.exec)('cmake', [`-DCMAKE_INSTALL_PREFIX=${binPath}`, '..'], {
            cwd: buildDir,
        });
        yield (0, exec_1.exec)('make', [], { cwd: buildDir });
        yield (0, exec_1.exec)(`make install`, [], {
            cwd: buildDir,
        });
    });
}
exports.makeBuildGoogleTest = makeBuildGoogleTest;
function buildGoogleTest(binPath, googleTestVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, core_1.info)(`Cloning googleTest repo with tag ${googleTestVersion}`);
        yield cloneGoogleTest(googleTestVersion);
        (0, core_1.info)(`Make GoogleTest binaries ${googleTestVersion}`);
        yield makeBuildGoogleTest(binPath);
    });
}
exports.buildGoogleTest = buildGoogleTest;
