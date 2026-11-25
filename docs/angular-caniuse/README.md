# Angular Can I Use Extraction Report

<!-- docs:navigation:start -->
[Español](README.es.md) · [Map](../README.md) · [Home](../../README.md)

> Historical record: original decisions and dates are retained; this is not proof of current release or implementation state.

<!-- docs:navigation:end -->

Generated at: 2026-07-05T19:48:27.842Z

This is a historical secondary-source snapshot, not Angular's official compatibility matrix or a current API verification.

## Counts

| Section | Expected | Actual | Source |
| --- | ---: | ---: | --- |
| Features | 220 | 220 | https://www.angular.courses/caniuse?tab=features |
| Diff | 220 | 220 | https://www.angular.courses/caniuse?tab=diff |
| Migrations | 13 | 13 | https://www.angular.courses/caniuse?tab=migrations |
| Update | 112 | 112 | https://www.angular.courses/caniuse?tab=update |
| MCP | 14 | 14 | https://www.angular.courses/caniuse?tab=mcp |
| ESLint | 88 | 88 | https://www.angular.courses/caniuse?tab=eslint |

## Artifacts

- `angular-caniuse.normalized.csv` — flat table with the requested columns.
- `angular-caniuse.normalized.json` — same data with raw per-row extraction metadata.
- `*.raw.json` — raw section snapshots.
- `manifest.json` — extraction counts, timestamps, and source URLs.

## Known extraction limits

- Features and Diff are extracted from the client-side Angular Courses data chunk because the rendered table exposes only part of the 220-row dataset at once.
- Update migrations expose item URLs and those are captured in `angular_courses_url`.
- CLI migrations expose Angular documentation links where present and those are captured in `angular_dev_url`.
- MCP rows do not expose stable per-item anchors in the rendered table, so the tab URL is recorded.
