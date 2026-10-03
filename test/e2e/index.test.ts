import {mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import {Stryker} from '@stryker-mutator/core';
import {afterAll, afterEach, beforeEach, expect, test} from 'vitest';
import type {LogLevel, PartialStrykerOptions} from '@stryker-mutator/api/core';

import * as plugin from '../../index.js';
import type {MarkdownReporterOptions} from '../../src/strykerValidationSchema.js';

declare global {
    // eslint-disable-next-line no-var
    var markdownReporterPluginUnderTest: typeof plugin | undefined;
}

const FIXTURE_DIR = resolve(import.meta.dirname, 'fixture');

const STRYKER_DIR = '.stryker';

const REPORT_FILE = `${STRYKER_DIR}/reports/mutation.md`;

const DEFAULT_REPORT_DIR = 'reports';

const DEFAULT_REPORT_FILE = `${DEFAULT_REPORT_DIR}/mutation/mutation.md`;

const FIXTURE_OUTPUT_DIRS = [STRYKER_DIR, DEFAULT_REPORT_DIR].map((dir) => resolve(FIXTURE_DIR, dir));

const BASE_OPTIONS: PartialStrykerOptions = {
    appendPlugins: [resolve(import.meta.dirname, 'plugin.js')],
    reporters: ['markdown'],
    testRunner: 'command',
    commandRunner: {command: 'node math.test.js'},
    mutate: ['math.js'],
    concurrency: 1,
    tempDirName: `${STRYKER_DIR}/tmp`,
    logLevel: 'off' as LogLevel,
};

const cases: [
    name: string,
    markdownReporterOptions: Partial<MarkdownReporterOptions['markdownReporter']>,
    reportFile: string,
][] = [
    ['default', {fileName: REPORT_FILE}, REPORT_FILE],
    ['splitErrors', {fileName: REPORT_FILE, splitErrors: true}, REPORT_FILE],
    ['defaultFileName', {}, DEFAULT_REPORT_FILE],
];

const originalCwd = process.cwd();

const removeFixtureOutput = () =>
    Promise.all(FIXTURE_OUTPUT_DIRS.map((dir) => rm(dir, {recursive: true, force: true})));

beforeEach(async () => {
    globalThis.markdownReporterPluginUnderTest = plugin;
    process.chdir(FIXTURE_DIR);
    await removeFixtureOutput();
});

afterEach(() => {
    process.chdir(originalCwd);
    globalThis.markdownReporterPluginUnderTest = undefined;
});

afterAll(removeFixtureOutput);

test.each(cases)('%s', async (name, markdownReporterOptions, reportFile) => {
    await new Stryker({...BASE_OPTIONS, markdownReporter: markdownReporterOptions}).runMutationTest();

    await expect(await readFile(resolve(FIXTURE_DIR, reportFile), 'utf8')).toMatchFileSnapshot(
        `./index.test.snap/${name}.md`,
    );
});

test('report write error does not crash Stryker', async () => {
    await mkdir(resolve(FIXTURE_DIR, STRYKER_DIR), {recursive: true});
    await writeFile(resolve(FIXTURE_DIR, STRYKER_DIR, 'reports'), '');

    await expect(
        new Stryker({...BASE_OPTIONS, markdownReporter: {fileName: REPORT_FILE}}).runMutationTest(),
    ).resolves.toBeDefined();
});
