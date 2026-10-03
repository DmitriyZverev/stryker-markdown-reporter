/**
 * @public
 */
export const strykerValidationSchema = {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    properties: {
        markdownReporter: {
            description: 'Configuration for the markdown reporter',
            type: 'object',
            additionalProperties: false,
            default: {},
            properties: {
                fileName: {
                    description: 'The relative filename for the markdown report',
                    type: 'string',
                    default: 'reports/mutation/mutation.md',
                },
                splitErrors: {
                    description: 'Show runtime and compile errors in separate columns instead of a single one',
                    type: 'boolean',
                    default: false,
                },
            },
        },
    },
};

export interface MarkdownReporterOptions {
    markdownReporter: {
        fileName: string;
        splitErrors: boolean;
    };
}
