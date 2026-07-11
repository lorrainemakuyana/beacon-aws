# DynamoDB Single-Table Design — Attendance Slice

Scope: the **event attendance with live updates** vertical slice. Entities in scope:
`Event`, `EventCode`, `Shift`, `Assignment` (volunteer↔shift), `Membership` (coordinator↔event),
`Attendance`, and an `ActiveCheckIn` pointer. `User` profile is included since it shares
the table; Incidents / Organizations / Notifications are **out of slice**.

Derived from the existing Firestore services in `mobile/firebase/services/` and
`web/src/firebase/services/`. We do **not** port collections 1:1 — arrays like
`assignedVolunteers[]` and `coordinators[]` become first-class items so they can be indexed.

---

## 1. Access patterns (list first)

| # | Pattern | Actor | Source in Firebase code |
|---|---------|-------|-------------------------|
| 1 | Get event by ID | both | `getEventById` |
| 2 | All shifts for an event | coordinator | `getShiftsByEventId` |
| 3 | **Live attendance for event X** (dashboard + subscription) | coordinator | new (the slice goal) |
| 4 | All shifts/events a volunteer is assigned to | volunteer | `getShiftsForUser` |
| 5 | A volunteer's shift(s) within a specific event | volunteer | `getUserShiftForEvent` |
| 6 | A volunteer's attendance history | volunteer | `getUserAttendanceRecords` |
| 7 | A volunteer's currently-active check-in | volunteer | `getActiveCheckIn` |
| 8 | Look up event by event code (check-in passphrase) | volunteer | `verifyEventCode` |
| 9 | Upcoming events by date | both | `getUpcomingEvents` |
| 10 | Events a coordinator manages | coordinator | `getManagerEvents` |

Write / server-authority operations: **create event**, **delete event**, **check in**,
**check out**, **sign up for shift**, **cancel shift**.

---

## 2. Table

`BeaconTable` — on-demand billing.

- Partition key: `PK` (string)
- Sort key: `SK` (string)

DynamoDB Streams are **not enabled for this slice**. Subscriptions are driven by mutation
return values via `@aws_subscribe` (see §4), which needs no stream and no extra Lambda
invocations. Enable Streams when there is async work that actually requires them.

Every item carries an `entityType` attribute (`EVENT`, `SHIFT`, `ASSIGNMENT`, …). AppSync
resolvers use it to map items to GraphQL types, and any future stream consumer needs it to
route. Cheap now, painful to backfill.

### Item shapes

| Entity | PK | SK | GSI1PK / GSI1SK | GSI2PK / GSI2SK | Notable attrs |
|--------|----|----|------------------|------------------|---------------|
| **Event** | `EVENT#<eid>` | `META` | — | `STATUS#<status>` / `DATE#<date>#<eid>` | title, status, startTime, endTime |
| **EventCode** lookup | `CODE#<code>` | `META` | — | — | eventId |
| **Shift** | `EVENT#<eid>` | `SHIFT#<sid>` | — | — | title, timeSlot, requiredVolunteers, **assignedCount** (init `0`), status |
| **Assignment** (vol↔shift) | `EVENT#<eid>` | `ASSIGN#<uid>#<sid>` | `USER#<uid>` / `ASSIGN#<eid>` | — | shiftId, eventDate, eventTitle, shiftTitle, timeSlot |
| **Membership** (coord↔event) | `EVENT#<eid>` | `MEMBER#<uid>` | `USER#<uid>` / `MEMBER#<eid>` | — | role (coordinator/collaborator), eventDate, eventTitle |
| **Attendance** | `EVENT#<eid>` | `ATT#<sid>#<uid>` | `USER#<uid>` / `ATT#<ts>` | — | status, checkIn.ts, checkOut.ts, eventDate, eventTitle, shiftTitle |
| **ActiveCheckIn** ptr | `USER#<uid>` | `ACTIVE_CHECKIN` | — | — | eventId, shiftId, attendanceSK |
| **User** profile | `USER#<uid>` | `PROFILE` | — | — | displayName, skills (Cognito owns auth) |

Everything under `PK = EVENT#<eid>` forms **one item collection**: event meta, shifts,
assignments, and attendance live in a single partition, served by targeted
`begins_with(SK, …)` queries. No LSIs, so the 10GB item-collection limit does not apply.

> Do not read this as "one query hydrates the dashboard." A 500-volunteer event is 500
> assignments + 500 attendance rows, well past the 1MB page limit — and the dashboard only
> wants `ATT#` anyway. The win is partition locality, not a single round trip.

### Key design notes

- **`ASSIGN#<uid>#<sid>`, not `ASSIGN#<uid>`.** The `<uid>`-only form hardcodes "one shift
  per volunteer per event." That matches today's `getUserShiftForEvent` (`shifts.ts:39-48`,
  which silently takes `docs[0]`) but reads like an accident, not a decision. The composite
  form serves pattern 5 with `begins_with(SK, "ASSIGN#<uid>#")` — same partition, same
  round trip, same RCU — and multi-shift volunteers stop being a migration.

- **`GSI1SK` holds no mutable values.** An earlier draft used `ASSIGN#<date>#<eid>`, where
  `<date>` is the event's date. Rescheduling an event would then force a rewrite of the
  `GSI1SK` on every Assignment, Membership, and Attendance item under it — a fan-out write
  triggered by a field edit. `eventDate` is carried as a plain attribute and sorted in the
  resolver instead (a volunteer has tens of assignments, not thousands). Attendance's
  `ATT#<ts>` is a check-in timestamp and is immutable, so it stays in the key.

- **Assignment and Attendance are denormalized.** `eventTitle`, `shiftTitle`, `timeSlot`
  (Assignment) and `eventTitle`, `shiftTitle` (Attendance) are copied onto the items so
  patterns 4 and 6 are each one query, not a query plus a `BatchGetItem` fan-back into
  `EVENT#<eid>/SHIFT#<sid>`. The attendance-history UI shows event/shift names, not IDs —
  without the copies, pattern 6 would fan back exactly like pattern 4 used to. These fields
  are near-immutable; a shift-title edit republishes the copies under that shift.

- **Event code is a lookup item, not an index.** GSIs cannot enforce uniqueness. A
  `CODE#<code>` item written with `attribute_not_exists(PK)` inside the event-create
  transaction makes collisions *impossible* rather than "enforced by convention" — and turns
  pattern 8 into a `GetItem`, deletes a whole GSI, and stops paying GSI write units on every
  event write. Rotating a code is a `Delete` + `Put` in one transaction.

- **`Shift.assignedCount` is required, not optional — and initialized to `0` at create.**
  With `assignedVolunteers[]` gone, nothing else can compute fullness. Initialization is
  load-bearing: the sign-up condition `assignedCount < requiredVolunteers` evaluates
  **false** when the attribute is missing (`ADD` would create it, but the condition check
  runs first), so a shift created without the attribute rejects every first sign-up.

- **"Full" is derived, not stored.** A `TransactWriteItems` can't observe the post-update
  counter, so it cannot atomically flip a stored `status` to `full` when the increment
  lands on `requiredVolunteers`. Rather than a second racy write, the resolver computes
  `full = assignedCount >= requiredVolunteers` when mapping the item. `Shift.status` keeps
  only lifecycle states (`open`, `active`, `completed`, `closed`) — one less invariant to
  keep consistent, and cancel needs no un-flip.

### GSIs

- **GSI1 "UserIndex"** — `GSI1PK = USER#<uid>`. One index serves every "things for a user"
  pattern; `begins_with(GSI1SK, …)` splits by entity: `ASSIGN#`, `MEMBER#`, `ATT#`.
  Sparse: `USER#<uid>/PROFILE` and `ACTIVE_CHECKIN` carry no GSI1 keys.
  Projection: `INCLUDE [entityType, shiftId, eventDate, eventTitle, shiftTitle, timeSlot,
  status, checkIn, checkOut]` — enough to render "my shifts" and "my attendance" without a
  table fetch. `checkIn`/`checkOut` are projected as whole maps (projections name top-level
  attributes only); without them the history view has no check-out time — `GSI1SK = ATT#<ts>`
  only carries check-in — and pattern 6 silently stops being a single query.

- **GSI2 "EventsByDate"** — `GSI2PK = STATUS#<status>`, `GSI2SK = DATE#<date>#<eid>`. Sparse;
  only Event items carry it. Projection `ALL` (Event items are small and few).

  Keyed on status rather than `ORG#<oid>` because `getUpcomingEvents` (`events.ts:10-19`) is
  **global** — the caller is a volunteer browsing events and has no org in hand. Partitioning
  by org would need an argument that doesn't exist at the call site. The hot-partition
  objection is real in principle and irrelevant at $0–2/month; revisit if a tenant-scoped
  event list ever ships.

  The partition set is the **real** status set, not the declared one: `draft`, `published`,
  `active`, `completed`, `cancelled`, **and `archived`** — web `archiveEvent`
  (`web/src/firebase/services/events.ts`) writes `status: "archived"` even though the
  `EventStatus` union in `interfaces/index.ts` doesn't include it (untyped `updateDoc` lets
  it through). Fix the type drift during migration; until then the index must expect the
  value. A status change is a single-item update — the Event just moves between GSI2
  partitions, no fan-out.

---

## 3. Pattern → operation mapping

| # | Operation |
|---|-----------|
| 1 | `GetItem(PK=EVENT#<eid>, SK=META)` |
| 2 | `Query(PK=EVENT#<eid>, SK begins_with "SHIFT#")` |
| 3 | `Query(PK=EVENT#<eid>, SK begins_with "ATT#")` + AppSync subscription `onAttendanceChanged(eventId)`. Per-shift drill-down: `begins_with "ATT#<sid>#"` |
| 4 | `Query(GSI1, GSI1PK=USER#<uid>, GSI1SK begins_with "ASSIGN#")` — single query; shift/event fields are projected |
| 5 | `Query(PK=EVENT#<eid>, SK begins_with "ASSIGN#<uid>#")` |
| 6 | `Query(GSI1, GSI1PK=USER#<uid>, GSI1SK begins_with "ATT#", ScanIndexForward=false)` — single query; titles and check-in/out times are projected |
| 7 | `GetItem(PK=USER#<uid>, SK=ACTIVE_CHECKIN)` |
| 8 | `GetItem(PK=CODE#<code>, SK=META)` → then pattern 5 to confirm the volunteer is assigned |
| 9 | `Query(GSI2, GSI2PK=STATUS#published, GSI2SK >= "DATE#<today>")` + same query on `STATUS#active`; merge-sort in the resolver (see §6) |
| 10 | `Query(GSI1, GSI1PK=USER#<uid>, GSI1SK begins_with "MEMBER#")` |

---

## 4. Server-authority writes (Lambda resolvers)

These enforce invariants the Firestore client used to check racily — they move into
transactional Lambda resolvers behind AppSync.

- **Create event** — `TransactWriteItems`:
  1. `Put` Event item.
  2. `Put` `CODE#<code>` lookup with `ConditionExpression: attribute_not_exists(PK)`.
  3. `Put` one Shift item per shift definition, each with `assignedCount: 0`. Firestore's
     `createEvent` (`web/src/firebase/services/events.ts`) creates shifts inline with the
     event; the migration keeps that atomicity. The `0` is mandatory — see the
     `assignedCount` design note. (`TransactWriteItems` caps at 100 items; an event with
     98+ shifts is not a real case.)
  A colliding code fails the transaction outright.

- **Delete event** — `Query(PK=EVENT#<eid>)` then `BatchWriteItem` deletes for every item
  in the partition (meta, shifts, assignments, memberships, attendance), **plus a `Delete`
  of the `CODE#<code>` lookup item**. The code item lives in its own partition, so a
  partition sweep alone orphans it — a stale code would keep resolving to a dead event and
  reserve that passphrase forever. Web `deleteEvent` also removes the event's incidents;
  that entity joins this sweep when the incident slice lands.

- **Check in** — `TransactWriteItems`:
  1. `Put` Attendance item. This is an intentional overwrite: the `ATT#<sid>#<uid>` row is
     *current state*, one row per volunteer per shift, which is what pattern 3's dashboard
     wants. Re-check-in resets it.
  2. `Put` `ACTIVE_CHECKIN` pointer with `ConditionExpression: attribute_not_exists(PK)`.
  A second concurrent check-in fails the condition → surface "already checked in to a shift"
  (replaces the `getActiveCheckIn` pre-read at `attendance.ts:49-50`).

- **Check out** — `TransactWriteItems`:
  1. `Update` Attendance `status=checked-out`, set `checkOut.ts`.
  2. `Delete` the `ACTIVE_CHECKIN` pointer with
     `ConditionExpression: attendanceSK = :sk`. Without the condition, a stale client can
     delete the pointer belonging to a *newer* check-in.

- **Sign up for shift** — `TransactWriteItems`:
  1. `Put` Assignment with `attribute_not_exists(PK)` to block duplicates.
  2. `Update` Shift `ADD assignedCount 1` with
     `ConditionExpression: assignedCount < requiredVolunteers`.
  No status flip: fullness is derived from the counter at read time (see design notes) —
  the transaction can't see the post-increment value anyway.

- **Cancel shift** (`cancelVolunteerShift`) — `TransactWriteItems`:
  1. `Delete` Assignment with `attribute_exists(PK)`.
  2. `Update` Shift `ADD assignedCount -1` with `ConditionExpression: assignedCount > :zero`.
  No un-flip needed for the same reason.

Each mutation returns the changed Attendance/Shift, and the check-in / check-out mutations
publish to the `onAttendanceChanged(eventId)` subscription via `@aws_subscribe`, so the
coordinator dashboard (pattern 3) updates live.

---

## 5. Auth (enforced at AppSync, not the table)

- Cognito groups `Coordinator` / `Volunteer` map to `UserRole`.
- Volunteers: can write their own Attendance (`volunteerId == $ctx.identity.sub`) and read
  their own USER# items.
- Coordinators: read all `EVENT#<eid>` children for events they hold a `Membership` on;
  manage shifts.
- Group directives on the schema + owner/resolver checks; no row-level rules in DynamoDB.

---

## 6. Resolved design questions

- **Tenancy** — moot. GSI2 keys on event status, not `ORG#<oid>`, because the caller of
  `getUpcomingEvents` has no organization in hand. `organizationId` stays a plain attribute
  on the Event item (it is optional on `User`, `interfaces/index.ts:10`, and required on
  `Event`, `:59` — so an org-partitioned index would have been unreliable anyway).

- **Attendance SK** — stays `ATT#<sid>#<uid>`. Switching to `ATT#<ts>` would break pattern
  3's one-row-per-volunteer dashboard semantics and make check-in non-idempotent. If
  check-in/check-out *history* is wanted later, append immutable
  `EVENT#<eid> / ATTEVT#<ts>#<uid>` items alongside the current-state row. Do not turn the
  current-state row into a log.

- **Event-code collisions** — solved structurally by the `CODE#<code>` lookup item, not by
  application-level enforcement.

- **Upcoming list vs. event status** — pattern 9 queries **both** `STATUS#published` and
  `STATUS#active` (two cheap Queries, merge-sorted in the resolver), so a same-day event
  that has flipped to in-progress stays visible to volunteers. Note the baseline: Firestore's
  `getUpcomingEvents` filters on **date only**, so today it also returns future-dated
  `draft`/`completed`/`cancelled`/`archived` events. Excluding those is an intentional
  behavior change, not an oversight.

## 7. Still open

- Does a shift-title or event-title edit need to republish denormalized copies synchronously,
  or is eventual consistency (a stream consumer, once Streams are on) acceptable? The copies
  now live on both Assignment **and** Attendance items. Deferred until titles are actually
  editable.
