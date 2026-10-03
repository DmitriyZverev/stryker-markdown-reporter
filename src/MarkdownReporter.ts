import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

import {commonTokens, tokens} from '@stryker-mutator/api/plugin';
import type {StrykerOptions} from '@stryker-mutator/api/core';
import type {Logger} from '@stryker-mutator/api/logging';
import type {Reporter} from '@stryker-mutator/api/report';

import {formatReport} from './formatReport.js';
import type {MutationTestMetricsResult, MetricsResult} from './types.js';
import type {MarkdownReporterOptions} from './strykerValidationSchema.js';

export class MarkdownReporter implements Reporter {
    public static readonly inject = tokens(commonTokens.options, commonTokens.logger);

    private readonly options: MarkdownReporterOptions & StrykerOptions;

    private readonly log: Logger;

    private mainPromise?: Promise<void>;

    public constructor(options: StrykerOptions, log: Logger) {
        this.options = options as MarkdownReporterOptions & StrykerOptions;
        this.log = log;
    }

    public onMutationTestReportReady(_report: unknown, {systemUnderTestMetrics}: MutationTestMetricsResult) {
        this.mainPromise = this.generateReport(systemUnderTestMetrics);
    }

    public wrapUp() {
        return this.mainPromise;
    }

    private async generateReport(systemUnderTestMetrics: MetricsResult) {
        const {
            markdownReporter: {fileName, splitErrors},
            thresholds,
        } = this.options;
        this.log.debug(`Using file "${fileName}"`);
        const markdown = formatReport(systemUnderTestMetrics, {thresholds, splitErrors});
        await mkdir(dirname(fileName), {recursive: true});
        await writeFile(fileName, markdown, 'utf8');
        this.log.info(`Your report can be found at: ${pathToFileURL(resolve(fileName)).href}`);
    }
}
