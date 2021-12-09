#! /usr/bin/env node
const { EntryGenerator } = require('../dist/');
const { usage } = require('yargs');

const options = {
  path: [],
  output: null,
  target: ['.proto'],
  ignore: ['node_modules', 'dist'],
  keepCase: true,
  comments: true,
  verbose: true,
};
/** Set CLI */
const cli = usage('Extract and merge locale files.\nUsage: $0 [options]')
  .alias('version', 'v')
  .help('help')
  .alias('help', 'h')
  .exitProcess(true)
  .parse(process.argv);

/**
 * Init Compiller
 *
 * @type {Compiller}
 * @param {IGenOptions}
 */
const generator = new EntryGenerator({ ...options, ...cli });

/** CLI Task Run */
generator.run();
