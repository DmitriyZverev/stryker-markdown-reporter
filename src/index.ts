import {declareClassPlugin, PluginKind} from '@stryker-mutator/api/plugin';

import {MarkdownReporter} from './MarkdownReporter.js';

export {strykerValidationSchema} from './strykerValidationSchema.js';

/**
 * @public
 */
export const strykerPlugins = [declareClassPlugin(PluginKind.Reporter, 'markdown', MarkdownReporter)];
