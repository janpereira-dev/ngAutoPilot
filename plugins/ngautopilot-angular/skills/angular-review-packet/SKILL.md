---
id: angular.docs.angular-review-packet
name: Angular Review Packet
description: Build a compact review packet for Angular PRs that highlights architecture, risk, validation, and rollback points for human or agent review.
stack:
  - Angular
category: docs
status: stable
version: 0.1.0
owner: NgAutoPilot
---

# Angular Review Packet

Use this skill when a PR or change needs a review-ready summary.

## Core Rule

```txt
Review packets should make risk visible before the diff is merged.
```

## Packet Contents

- change summary
- files touched
- architecture impact
- validation evidence
- rollback notes
- open risks

## Output

Return:

1. A concise review packet.
2. The main risks.
3. The validation performed.
4. The rollback or follow-up path.
