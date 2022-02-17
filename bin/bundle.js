#! /usr/bin/env node
const { EntryGenerator } = require('../dist/');

/**
 * Init Compiller
 *
 * @type {Compiller}
 * @param {IGenOptions}
 */
const generator = new EntryGenerator();

/** CLI Task Run */
generator.run();
