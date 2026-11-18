/**
 * Lets plain Node load the app's TypeScript modules (with the "@/" alias), so
 * tests and scripts can require lib/ code without a bundler.
 */
const fs = require("fs");
const path = require("path");
const Module = require("module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolveAlias(request, ...rest) {
  const resolved = request.startsWith("@/") ? path.join(root, request.slice(2)) : request;
  return originalResolve.call(this, resolved, ...rest);
};

require.extensions[".ts"] = require.extensions[".tsx"] = (mod, filename) => {
  const out = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  });
  mod._compile(out.outputText, filename);
};

module.exports = { root };
