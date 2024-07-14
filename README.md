# grpc-setup

This GitHub Action package is designed to install and build gRPC C++ dependencies for your project. It compiles, installs, and caches the gRPC environment for you, making it easy to use gRPC in your GitHub workflows.
In addition *googletest* binaries can be included with the `include-google-test` flag.

## gRPC C++ Template Example

Check this [gRPC C++ Template](https://github.com/hindicator/grpc-cpp-template) repository.

**Example CI Job**
```
# This workflow will do a clean installation of gRPC dependencies, cache/restore them, build the source code and build/test you project.

name: Build & Test gRPC C++ example

on:
  pull_request:
    branches:
      - "*"
  push:
    branches:
      - "master"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: hindicator/grpc-setup@v1
        with:
          grpc-version: 1.60.0

      - name: Build gRPC C++ example
        run: |
          cd example
          mkdir -p build
          cd build
          cmake -DCMAKE_PREFIX_PATH="$GRPC_ROOT" ..
          make
```

## Inputs

This action has the following inputs:

- `grpc-version`: The version of gRPC to setup. Default is `1.60.0`.
- `grpc-installation-path`: The installation path of gRPC. Default is `grpc`.
- `token`: Used to pull gRPC distributions from hindicator/grpc-versions. Since there's a default, this is typically not supplied by the user. Default is `github.token`.

## Usage

To use this action in your workflow, you can add a step in your workflow file that uses this action:

```yml
steps:
  - name: Setup gRPC
    uses: hindicator/grpc-setup@v1
    with:
      grpc-version: '1.60.0'
      grpc-installation-path: 'grpc'
```

This will install and build gRPC version `1.60.0` at the path `grpc`.

## How it works

This action works by:

1. Restoring the gRPC installation from cache if it exists.
2. If the installation is not cached, it sets up the specified gRPC version.
3. It then builds gRPC at the specified installation path.
4. Finally, it caches the gRPC installation for future runs.

The action uses the [`cacheGrpcInstallation`](src/utils.ts#Lxx) and [`restoreGrpcInstallation`](src/utils.ts#Lxx) functions from [`src/utils.ts`](command:_github.copilot.openSymbolInFile?%5B%22src%2Futils.ts%22%2C%22src%2Futils.ts%22%5D "src/utils.ts") to handle caching. The [`installGrpcVersion`](src/utils.ts#Lxx) and [`makeGrpc`](src/utils.ts#Lxx) functions are used to install and build gRPC.

## Testing

Unit tests for the action's main functionality are located in [`__tests__/main.test.ts`](command:_github.copilot.openSymbolInFile?%5B%22__tests__%2Fmain.test.ts%22%2C%22__tests__%2Fmain.test.ts%22%5D "__tests__/main.test.ts"). These tests should be run as if the action was called from a workflow. Specifically, the inputs listed in [`action.yml`](command:_github.copilot.openRelativePath?%5B%22action.yml%22%5D "action.yml") should be set as environment variables following the pattern `INPUT_<INPUT_NAME>`.

## Building

To build this TypeScript project, run the [`build`](command:_github.copilot.openSymbolInFile?%5B%22package.json%22%2C%22build%22%5D "package.json") script in the [`package.json`](command:_github.copilot.openRelativePath?%5B%22package.json%22%5D "package.json") file:

```sh
yarn run build
```

## Contributing

Contributions are welcome! Please submit a pull request or create an issue to contribute to this project.