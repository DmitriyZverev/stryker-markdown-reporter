// Stryker loads this module with a native import(), bypassing vitest. It re-exports the plugin
// that the test imported through vitest, so the reporter calls are counted in the src coverage.
// Stryker child processes don't have the global set, so they get no plugins from here.
export const strykerPlugins = globalThis.markdownReporterPluginUnderTest?.strykerPlugins ?? [];
export const strykerValidationSchema = globalThis.markdownReporterPluginUnderTest?.strykerValidationSchema;
