import {test, expect} from 'vitest';

import {formatReport, type FormatOptions} from './formatReport.js';
import type {Metrics, MetricsResult} from './types.js';

const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
    thresholds: {high: 80, low: 60, break: null},
    splitErrors: false,
};

const createMetrics = (metrics: Partial<Metrics> = {}): Metrics => ({
    mutationScore: 100,
    mutationScoreBasedOnCoveredCode: 100,
    killed: 0,
    timeout: 0,
    survived: 0,
    noCoverage: 0,
    ignored: 0,
    runtimeErrors: 0,
    compileErrors: 0,
    ...metrics,
});

const createFile = (name: string, metrics: Partial<Metrics> = {}): MetricsResult => ({
    name,
    file: {},
    childResults: [],
    metrics: createMetrics(metrics),
});

const createDirectory = (
    name: string,
    childResults: MetricsResult[],
    metrics: Partial<Metrics> = {},
): MetricsResult => ({
    name,
    childResults,
    metrics: createMetrics(metrics),
});

const cases: [name: string, metrics: MetricsResult, formatOptions: FormatOptions][] = [
    // Empty project: no files, scores are not available
    [
        'emptyProject',
        createDirectory('All files', [], {mutationScore: NaN, mutationScoreBasedOnCoveredCode: NaN}),
        DEFAULT_FORMAT_OPTIONS,
    ],
    // Files at the root and in nested directories, all score markers including boundary values
    [
        'nestedFiles',
        createDirectory(
            'All files',
            [
                createFile('index.ts', {
                    mutationScore: 80,
                    mutationScoreBasedOnCoveredCode: 90.123,
                    killed: 8,
                    survived: 2,
                }),
                createDirectory('src', [
                    createFile('a.ts', {
                        mutationScore: 60,
                        mutationScoreBasedOnCoveredCode: 79.99,
                        killed: 3,
                        timeout: 1,
                        survived: 2,
                        noCoverage: 1,
                    }),
                    createDirectory('utils', [
                        createFile('b.ts', {
                            mutationScore: 59.99,
                            mutationScoreBasedOnCoveredCode: 0,
                            survived: 5,
                            ignored: 4,
                        }),
                        createFile('c.ts', {
                            mutationScore: NaN,
                            mutationScoreBasedOnCoveredCode: NaN,
                            runtimeErrors: 2,
                            compileErrors: 3,
                        }),
                    ]),
                ]),
            ],
            {
                mutationScore: 65.5,
                mutationScoreBasedOnCoveredCode: 72.25,
                killed: 11,
                timeout: 1,
                survived: 9,
                noCoverage: 1,
                ignored: 4,
                runtimeErrors: 2,
                compileErrors: 3,
            },
        ),
        DEFAULT_FORMAT_OPTIONS,
    ],
    // Split errors and break threshold
    [
        'splitErrors',
        createDirectory(
            'All files',
            [
                createFile('index.ts', {
                    mutationScore: 40,
                    mutationScoreBasedOnCoveredCode: 50,
                    killed: 4,
                    survived: 6,
                    runtimeErrors: 1234,
                    compileErrors: 5,
                }),
            ],
            {
                mutationScore: 40,
                mutationScoreBasedOnCoveredCode: 50,
                killed: 4,
                survived: 6,
                runtimeErrors: 1234,
                compileErrors: 5,
            },
        ),
        {thresholds: {high: 90, low: 70, break: 50}, splitErrors: true},
    ],
    // Markdown special characters in directory and file names are escaped
    [
        'escaping',
        createDirectory('All files', [
            createDirectory('__tests__', [
                createFile('a_b_c.test.ts'),
                createFile('*glob*.ts'),
                createFile('pipe|name.ts'),
                createFile('`code`.ts'),
                createFile('[link](url).ts'),
                createFile('<b>html</b>.ts'),
                createFile('back\\slash.ts'),
                createFile('~~strike~~.ts'),
                createFile('&amp;.ts'),
                createFile('$math$.ts'),
            ]),
        ]),
        DEFAULT_FORMAT_OPTIONS,
    ],
];

test.each(cases)('%s', async (name, metrics, formatOptions) => {
    await expect(formatReport(metrics, formatOptions)).toMatchFileSnapshot(`./formatReport.test.snap/${name}.md`);
});
