export interface Metrics {
    mutationScore: number;
    mutationScoreBasedOnCoveredCode: number;
    killed: number;
    timeout: number;
    survived: number;
    noCoverage: number;
    ignored: number;
    runtimeErrors: number;
    compileErrors: number;
}

export interface MetricsResult {
    name: string;
    file?: object;
    childResults: MetricsResult[];
    metrics: Metrics;
}

export interface MutationTestMetricsResult {
    systemUnderTestMetrics: MetricsResult;
}
