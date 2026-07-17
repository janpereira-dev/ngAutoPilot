---
id: angular.performance.ng-optimized-image-adoption
name: NgOptimizedImage Adoption
description: >
  Adopt Angular's NgOptimizedImage for post-upgrade image performance improvements when the app is already stable and the goal is to optimize priority images, preconnects, responsive sizing, and loading behavior in a controlled slice.
stack:
  - Angular
  - TypeScript
category: performance
status: stable
version: 0.5.2
owner: NgAutoPilot
triggers:
  - NgOptimizedImage
  - image performance
  - LCP optimization
compatibility:
  angular:
    min: "15"
---

# NgOptimizedImage Adoption

## Purpose

Adopt `NgOptimizedImage` for post-upgrade image performance work.

## When to Use

- The app is stable on the target Angular version.
- Image performance is a current optimization target.
- The team wants to improve LCP and image loading behavior incrementally.

## When Not to Use

- The app is still in a version upgrade.
- The issue is a functional bug unrelated to images.

## Required Inputs

- image-heavy routes
- hero assets
- responsive image sizes
- build and runtime constraints

## Procedure

1. Pick image-heavy screens first.
2. Replace priority images with `NgOptimizedImage`.
3. Add explicit sizes and loading hints.
4. Validate layout shifts and image fetches.

## Do

- Optimize the most visible images first.
- Check preconnect and priority behavior.
- Validate local and production builds.

## Do Not

- Do not rewrite every image usage blindly.
- Do not mix this change with an upgrade hop.
- Do not assume all images should be eager.

## Review Checklist

- [ ] Priority images are optimized.
- [ ] Layout remains stable.
- [ ] Performance impact is measured or noted.

## Expected Output

1. Image slice optimized.
2. Remaining image debt.
3. Performance notes.
4. Follow-up list.

## Exit Criteria

- The image slice is validated.
- Remaining opportunities are documented.
