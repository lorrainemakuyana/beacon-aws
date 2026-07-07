# Beacon → Serverless AWS Rebuild

Beacon is a mobile-first **volunteer operations platform** — real-time event coordination, attendance tracking, and incident reporting. This repo rebuilds it on **AWS-native serverless** infrastructure.

**Purpose:** learn Cognito, DynamoDB, AppSync, S3, and Lambda on a real app, with all infrastructure defined explicitly in **CDK** to see the wiring end to end.

The existing `mobile/` (React Native / Expo) and `web/` (Next.js) apps were built on Firebase. They are being migrated service-by-service onto AWS.

## Target Architecture

```
Mobile (RN/Expo) ─┐
                  ├─► AppSync (GraphQL + subscriptions)
Web (Next.js) ────┘        │
                           ├─► DynamoDB (single-table + Streams)
                           ├─► Lambda   (resolvers / server logic)
                           └─► S3        (incident photos)
   Cognito ──── auth gate for all of the above
   Amplify Hosting / S3+CloudFront ──── web dashboard
```

## Firebase → AWS Mapping

| Firebase (now) | AWS (target) | Notes |
|---|---|---|
| Firestore | DynamoDB | Single-table; model access patterns, not entities |
| Firestore listeners | AppSync subscriptions | Real-time events/attendance |
| Firebase Auth | Cognito User Pools | Groups map to roles |
| Firestore rules | Cognito groups + AppSync auth | Authz moves to API layer |
| Firebase Storage | S3 | Presigned URLs for uploads |
| Client-side logic | Client + Lambda | Move server-authority logic to Lambda |
| Vercel/Netlify | Amplify Hosting or S3+CloudFront | — |

## Prerequisites (day one)

- Root MFA enabled; IAM admin user created (never use root daily).
- Billing alarm at $10.
- CDK installed (TypeScript or Python).

## Build Order

Take **one vertical slice first** — event attendance with live updates — end to end. The rest is repetition.

1. **Cognito** user pool + groups (`Coordinator`, `Volunteer`); login working on web, tokens flowing.
2. **DynamoDB** single-table schema from the access-pattern list; seed test data.
3. **AppSync** schema + resolvers over DynamoDB; queries/mutations working.
4. **AppSync subscriptions**; confirm live updates on the dashboard.
5. **S3** + presigned uploads for incident photos.
6. Point the **React Native** app at the same AppSync API.
7. **Host** the web dashboard.

## Highest-Leverage Step: DynamoDB Modeling

Don't port Firestore collections 1:1. Process:

1. List every access pattern first (e.g. "all volunteers for an event," "all incidents by volunteer," "live attendance for event X").
2. Design one table with composite keys (PK/SK) to serve them.
3. Add GSIs for patterns the primary key can't cover.

This is where NoSQL-on-AWS diverges most from Firestore. Spend real time here.

## Auth Mapping

- Firestore role rules → Cognito groups.
- Enforcement → AppSync group directives + resolver-level checks.
- Same role model, enforced at the API layer instead of the DB layer.

## Cost

Serverless = pay-per-request, nothing runs idle. At learning scale: **~$0–2/month.** Cognito (<10k users), Lambda (1M free req), DynamoDB on-demand, and S3 free tier are all effectively free. Safe to leave deployed.

> Confirm current free-tier limits and regional pricing before committing.

## Scope Discipline

- One slice end-to-end before breadth.
- Build Cognito + AppSync + DynamoDB explicitly in CDK the first time (see the wiring). Consider Amplify's convenience only afterward.

## Services Learned Here (reused later by orcher)

IAM, DynamoDB, S3, Cognito, CloudWatch, CDK all carry over. AppSync + Lambda + API Gateway are beacon-specific. orcher then adds the networking half (VPC, ALB, ECS Fargate) on top.

## Repository Structure

```
/
├── mobile/    # React Native / Expo app (being migrated off Firebase)
├── web/       # Next.js web dashboard (being migrated off Firebase)
├── infra/     # CDK infrastructure (Cognito, DynamoDB, AppSync, S3, Lambda) — to be added
└── .kiro/     # Specs and design docs
```

## License

Private — All rights reserved
