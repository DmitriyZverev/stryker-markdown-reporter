import type {MutationScoreThresholds} from '@stryker-mutator/api/core';

import type {Metrics, MetricsResult} from './types.js';

type Alignment = 'left' | 'right';

interface Row {
    name: string;
    metrics: Metrics;
}

interface Column {
    name: string;
    alignment: Alignment;
    getValue: (row: Row) => string;
}

interface AlignmentFormat {
    formatMarker: (width: number) => string;
    pad: (value: string, width: number) => string;
}

const ALIGNMENTS = Object.freeze({
    left: {
        formatMarker: (width) => `:${'-'.repeat(width - 1)}`,
        pad: (value, width) => value.padEnd(width),
    },
    right: {
        formatMarker: (width) => `${'-'.repeat(width - 1)}:`,
        pad: (value, width) => value.padStart(width),
    },
}) satisfies Record<Alignment, AlignmentFormat>;

const MIN_COLUMN_WIDTH = 3;

const SCORE_MARKERS = Object.freeze({
    GOOD: '🟢',
    WARNING: '🟡',
    DANGER: '🔴',
});

const formatTable = (columns: Column[], rows: Row[]) => {
    const sizedColumns = columns.map((column) => ({
        ...column,
        width: Math.max(MIN_COLUMN_WIDTH, column.name.length, ...rows.map((row) => column.getValue(row).length)),
    }));
    const formatLine = (getCell: (column: (typeof sizedColumns)[number]) => string) =>
        `| ${sizedColumns.map((column) => ALIGNMENTS[column.alignment].pad(getCell(column), column.width)).join(' | ')} |`;
    return [
        formatLine(({name}) => name),
        formatLine(({alignment, width}) => ALIGNMENTS[alignment].formatMarker(width)),
        ...rows.map((row) => formatLine(({getValue}) => getValue(row))),
    ];
};

const formatScore = (score: number, {high, low}: MutationScoreThresholds) => {
    if (Number.isNaN(score)) {
        return 'n/a';
    }
    const status = score >= high ? SCORE_MARKERS.GOOD : score >= low ? SCORE_MARKERS.WARNING : SCORE_MARKERS.DANGER;
    return `${status} ${score.toFixed(2)}%`;
};

export interface FormatOptions {
    thresholds: MutationScoreThresholds;
    splitErrors: boolean;
}

const metricColumn = (name: string, getValue: (metrics: Metrics) => number | string): Column => ({
    name,
    alignment: 'right',
    getValue: ({metrics}) => String(getValue(metrics)),
});

const createColumns = ({thresholds, splitErrors}: FormatOptions): Column[] => [
    {name: 'File', alignment: 'left', getValue: ({name}) => name},
    metricColumn('score', (metrics) => formatScore(metrics.mutationScore, thresholds)),
    metricColumn('covered', (metrics) => formatScore(metrics.mutationScoreBasedOnCoveredCode, thresholds)),
    metricColumn('killed', (metrics) => metrics.killed),
    metricColumn('timeout', (metrics) => metrics.timeout),
    metricColumn('survived', (metrics) => metrics.survived),
    metricColumn('no cov', (metrics) => metrics.noCoverage),
    metricColumn('ignored', (metrics) => metrics.ignored),
    ...(splitErrors
        ? [
              metricColumn('runtime errors', (metrics) => metrics.runtimeErrors),
              metricColumn('compile errors', (metrics) => metrics.compileErrors),
          ]
        : [metricColumn('errors', (metrics) => metrics.runtimeErrors + metrics.compileErrors)]),
];

const formatThresholds = ({high, low, break: breaking}: MutationScoreThresholds) =>
    `Thresholds: ${SCORE_MARKERS.GOOD} ≥ ${high}, ${SCORE_MARKERS.WARNING} ≥ ${low}, ${SCORE_MARKERS.DANGER} < ${low}${breaking === null ? '' : `, break < ${breaking}`}`;

const escapeMarkdown = (value: string) => value.replace(/[\\`*_[\]<>|~&$]/g, '\\$&');

const collectFiles = (result: MetricsResult, path: string[] = []): Row[] =>
    result.childResults.flatMap((child) =>
        child.file
            ? [{name: escapeMarkdown([...path, child.name].join('/')), metrics: child.metrics}]
            : collectFiles(child, [...path, child.name]),
    );

export const formatReport = (result: MetricsResult, formatOptions: FormatOptions) =>
    [
        ...formatTable(createColumns(formatOptions), [
            {name: '**All files**', metrics: result.metrics},
            ...collectFiles(result),
        ]),
        '',
        formatThresholds(formatOptions.thresholds),
        '',
    ].join('\n');
