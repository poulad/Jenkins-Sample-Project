module.exports = {
    default: `--require-module "ts-node/register" --require "step-definitions/**/*.ts" ` +
        `--format-options '{"snippetInterface": "synchronous"}' `
}