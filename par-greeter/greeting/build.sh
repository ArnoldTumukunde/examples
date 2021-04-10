#!/usr/bin/env bash -o errexit -o nounset -o pipefail

# This script builds all subprojects and puts all created Wasm modules in one dir
mkdir -p artifacts
cargo update
fce build --release

rm artifacts/*
cp target/wasm32-wasi/release/greeting.wasm artifacts/
