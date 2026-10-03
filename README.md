# stryker-markdown-reporter

A [StrykerJS](https://stryker-mutator.io/) reporter plugin that writes mutation
testing results as a Markdown table.

The report is plain Markdown, so it can be committed, attached to a pull request
comment or appended to a GitHub Actions job summary.

## Example

| File                |     score |   covered | killed | timeout | survived | no cov | ignored | errors |
| :------------------ | --------: | --------: | -----: | ------: | -------: | -----: | ------: | -----: |
| **All files**       | 🟡 70.00% | 🟢 82.35% |     13 |       1 |        3 |      3 |       0 |      1 |
| src/math.ts         | 🟢 90.00% | 🟢 90.00% |      8 |       1 |        1 |      0 |       0 |      0 |
| src/utils/format.ts | 🔴 50.00% | 🟡 71.43% |      5 |       0 |        2 |      3 |       0 |      1 |

Thresholds: 🟢 ≥ 80, 🟡 ≥ 60, 🔴 < 60, break < 50

## Requirements

- Node.js 22 or later
- StrykerJS 10 (`@stryker-mutator/core`)

## Installation

```sh
npm install --save-dev stryker-markdown-reporter
```

## Usage

Add the plugin and the `markdown` reporter to your Stryker configuration, for
example `stryker.config.json`:

```json
{
    "appendPlugins": ["stryker-markdown-reporter"],
    "reporters": ["clear-text", "progress", "markdown"]
}
```

After a run, the report is written to `reports/mutation/mutation.md`.

## Options

Options are set in the `markdownReporter` section of the Stryker configuration:

```json
{
    "markdownReporter": {
        "fileName": "reports/mutation/mutation.md",
        "splitErrors": false
    }
}
```

| Option        | Type      | Default                        | Description                                                                  |
| ------------- | --------- | ------------------------------ | ---------------------------------------------------------------------------- |
| `fileName`    | `string`  | `reports/mutation/mutation.md` | Path of the report file, relative to the working directory.                  |
| `splitErrors` | `boolean` | `false`                        | Show runtime and compile errors in separate columns instead of a single one. |

## Report

The first row contains the totals for the whole project, followed by one row per
mutated file.

| Column     | Description                                                                 |
| ---------- | --------------------------------------------------------------------------- |
| `score`    | Mutation score: the share of detected mutants among all valid mutants.      |
| `covered`  | Mutation score based on covered code: mutants without coverage are ignored. |
| `killed`   | Mutants detected by a failing test.                                         |
| `timeout`  | Mutants detected by a test timeout.                                         |
| `survived` | Mutants that no test detected.                                              |
| `no cov`   | Mutants in code that no test covers.                                        |
| `ignored`  | Mutants excluded from the run.                                              |
| `errors`   | Mutants that caused a runtime or compile error.                             |

Scores are marked according to the `thresholds` option of Stryker: 🟢 at or
above `high`, 🟡 at or above `low`, 🔴 below `low`. A score is shown as `n/a`
when there are no valid mutants.

## License

[MIT](LICENSE)
