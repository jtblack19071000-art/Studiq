/// <reference types="node" />
// Vercel's Node runtime loads this file as CommonJS — @expo/server's own Vercel adapter example
// uses require()/module.exports for exactly that reason, not ESM import/export.
/* eslint-disable @typescript-eslint/no-require-imports */
const { createRequestHandler } = require('@expo/server/adapter/vercel');

module.exports = createRequestHandler({
  build: require('path').join(__dirname, '../dist/server'),
});
