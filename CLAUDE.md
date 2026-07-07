# CLAUDE.md

Guidance for Claude Code when working in this repo.

## What this repo is

Beacon is a **volunteer operations platform** (real-time event coordination, attendance tracking, incident reporting). This repo is a **learning-driven rebuild of Beacon on AWS-native serverless**, migrating off Firebase. The point is to learn Cognito, DynamoDB, AppSync, S3, and Lambda by wiring them **explicitly in CDK** — not to reach for managed convenience layers first.

See `README.md` for the full architecture, Firebase→AWS mapping, and build order.

## Structure

- `mobile/` — React Native / Expo app. Currently Firebase-backed (`mobile/firebase/`), being migrated to AppSync.
- `web/` — Next.js web dashboard. Currently Firebase-backed (`web/src/firebase/`), being migrated to AppSync.
- `infra/` — CDK infrastructure (to be added): Cognito, DynamoDB, AppSync, S3, Lambda.
- `.kiro/specs/` — requirements, design, and task specs.

## Working principles

- **One vertical slice end to end before breadth.** The first slice is event attendance with live updates: Cognito → DynamoDB → AppSync query/mutation → AppSync subscription → dashboard.
- **CDK-first, explicit wiring.** Define Cognito + AppSync + DynamoDB by hand in CDK the first time so the integration is visible. Only consider Amplify's convenience afterward.
- **DynamoDB is single-table.** Do NOT port Firestore collections 1:1. Start from the list of access patterns, design one table with composite PK/SK, and add GSIs only for patterns the primary key can't serve. This is the highest-leverage design work — treat it carefully.
- **Auth is Cognito groups** (`Coordinator`, `Volunteer`), enforced at the API layer via AppSync group directives + resolver-level checks (not at the DB layer as Firestore rules did).
- **Server-authority logic goes in Lambda**, not the client.

## Conventions

- Prefer TypeScript across CDK, mobile, and web.
- Keep changes scoped to the current slice; don't scaffold breadth ahead of the vertical slice.
- Verify free-tier limits and regional pricing before introducing a new AWS service.

## Cost guardrail

Target is ~$0–2/month at learning scale. A $10 billing alarm should exist. Flag anything that could push usage past free-tier limits.

## Git

- End commit messages with:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- Commit or push only when asked.
