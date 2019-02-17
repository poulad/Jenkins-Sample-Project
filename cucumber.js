const formatOptionsString = JSON.stringify({
   snippetInterface: "synchronous"
})

module.exports = {
   default: `` +
      `--require-module "ts-node/register" ` +
      `--require "src/**/*.ts" ` +
      `--format-options '${formatOptionsString}' ` +
      `--format 'summary' ` +
      `--parallel 5 `
}
