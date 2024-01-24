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
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const fs_1 = require("fs");
const core_1 = require("@actions/core");
const utils_1 = require("./utils");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const versionSpec = (0, core_1.getInput)(utils_1.INPUT_GRPC_VERSION);
        const installationPath = 'cache/' + (0, core_1.getInput)(utils_1.INPUT_INSTALLATION_PATH);
        const isInstallationCached = yield (0, utils_1.restoreGrpcInstallation)(versionSpec, installationPath);
        if (isInstallationCached) {
            return;
        }
        (0, core_1.info)(`Setup grpc version spec ${versionSpec}`);
        if ((0, fs_1.existsSync)('grpc')) {
            (0, core_1.info)(`Found cloned grpc repo`);
        }
        else {
            yield (0, utils_1.installGrpcVersion)(versionSpec);
        }
        yield (0, utils_1.makeGrpc)(installationPath);
        yield (0, utils_1.cacheGrpcInstallation)(versionSpec, installationPath);
    });
}
exports.run = run;
// main()
//   .then((msg) => {
//     console.log(msg);
//   })
//   .catch((err) => {
//     setFailed(err.message);
//   });
