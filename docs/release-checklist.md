# Release Checklist

Use this checklist when preparing a public NgAutoPilot release.

## Pre-release

1. Confirm `main` is clean and includes the latest validated merge.
2. Confirm `package.json` has the intended release version.
3. Run:
   - `npm run skills:validate`
   - `npm run consistency:validate`
   - `npm run skills:catalog`
   - `npm run marketplaces:validate`
   - `npm pack --dry-run`
4. Confirm the tarball includes:
   - `bin/ng-autopilot.mjs`
   - `skills/`
   - `adapters/`
   - `catalog.json`
   - `README.md`
   - `CHANGELOG.md`

## npm Publish

5. Sign in to npm:
   - `npm login`
   - `npm whoami`
6. Publish the package:
   - `npm publish`
7. If npm requests an OTP:
   - `npm publish --otp <code>`

## GitHub Release

8. Create the release tag:
   - `git tag v0.2.1`
   - `git push origin v0.2.1`
9. Create the GitHub Release:
   - title: `NgAutoPilot v0.2.1`
   - add release notes
   - link the npm package

## Post-release

10. Verify the public package:
    - `npm view ngautopilot`
    - `npx ng-autopilot help`
11. If you want automation:
    - keep `.github/workflows/release.yml` for `release` published events
    - keep `workflow_dispatch` as a manual fallback
    - configure Trusted Publishing in npm

## Release Gates

Use this order before publishing:

```bash
npm run skills:validate
npm run consistency:validate
npm run marketplaces:validate
npm pack --dry-run
```

`skills:validate` stays strict. `consistency:validate` is the main release gate.

