import {defineConfig} from 'vitest/config';

import e2eTsconfig from './tsconfig.test.e2e.json' with {type: 'json'};
import unitTsconfig from './tsconfig.test.unit.json' with {type: 'json'};

// eslint-disable-next-line import/no-default-export
export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            include: ['index.ts', 'src/**/*.ts'],
            reporter: ['text', 'html', 'json', 'json-summary'],
            reportsDirectory: '.coverage',
            thresholds: {
                branches: 100,
                functions: 100,
                lines: 100,
                statements: 100,
            },
        },
        typecheck: {
            enabled: true,
        },
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    include: unitTsconfig.include,
                    typecheck: {tsconfig: 'tsconfig.test.unit.json', include: unitTsconfig.include},
                },
            },
            {
                extends: true,
                test: {
                    name: 'e2e',
                    include: e2eTsconfig.include,
                    typecheck: {tsconfig: 'tsconfig.test.e2e.json', include: e2eTsconfig.include},
                },
            },
        ],
    },
});
