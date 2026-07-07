# DynamoDB Single-Table Design — Attendance Slice

Scope: the **event attendance with live updates** vertical slice. Entities in scope:
`Event`, `Shift`, `Assignment` (volunteer↔shift), `Membership` (coordinator↔event),
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
| 5 | A volunteer's shift within a specific event | volunteer | `getUserShiftForEvent` |
| 6 | A volunteer's attendance history | volunteer | `getUserAttendanceRecords` |
| 7 | A volunteer's currently-active check-in | volunteer | `getActiveCheckIn` |
| 8 | Look up event by event code (check-in passphrase) | volunteer | `verifyEventCode` |
| 9 | Upcoming events by date | both | `getUpcomingEvents` |
| 10 | Events a coordinator manages | coordinator | `getManagerEvents` |

Write / server-authority operations: **check in**, **check out**, **sign up for shift**.

---

## 2. Table

`BeaconTable` — on-demand billing, DynamoDB Streams enabled (feeds AppSync subscriptions
and future async work).

- Partition key: `PK` (string)
- Sort key: `SK` (string)

### Item shapes

| Entity | PK | SK | GSI1PK / GSI1SK | GSI2PK | GSI3PK / GSI3SK | Notable attrs |
|--------|----|----|------------------|--------|------------------|---------------|
| **Event** | `EVENT#<eid>` | `META` | — | `CODE#<code>` | `ORG#<oid>` / `DATE#<date>#<eid>` | title, status, startTime, endTime |
| **Shift** | `EVENT#<eid>` | `SHIFT#<sid>` | — | — | — | title, timeSlot, requiredVolunteers, status |
| **Assignment** (vol↔shift) | `EVENT#<eid>` | `ASSIGN#<uid>` | `USER#<uid>` / `ASSIGN#<date>#<eid>` | — | — | shiftId |
| **Membership** (coord↔event) | `EVENT#<eid>` | `MEMBER#<uid>` | `USER#<uid>` / `MEMBER#<date>#<eid>` | — | — | role (coordinator/collaborator) |
| **Attendance** | `EVENT#<eid>` | `ATT#<sid>#<uid>` | `USER#<uid>` / `ATT#<ts>` | — | — | status, checkIn.ts, checkOut.ts |
| **ActiveCheckIn** ptr | `USER#<uid>` | `ACTIVE_CHECKIN` | — | — | — | eventId, shiftId, attendanceSK |
| **User** profile | `USER#<uid>` | `PROFILE` | — | — | — | displayName, skills (Cognito owns auth) |

Everything under `PK = EVENT#<eid>` forms **one item collection**: a single
`Query(PK = EVENT#<eid>)` returns the event meta + all shifts + assignments + attendance —
one round trip to hydrate the whole event dashboard.

### GSIs

- **GSI1 "UserIndex"** — `GSI1PK = USER#<uid>`. One index serves every "things for a user"
  pattern; `begins_with(GSI1SK, …)` splits by entity: `ASSIGN#`, `MEMBER#`, `ATT#`.
  The `#<date>#` prefix keeps results sorted by event date.
- **GSI2 "CodeIndex"** — sparse; only Event items carry `GSI2PK = CODE#<code>`. Event lookup
  by passphrase.
- **GSI3 "EventsByDate"** — `GSI3PK = ORG#<oid>`, `GSI3SK = DATE#<date>#<eid>`. Lists events
  by date within a tenant (org partitions avoid a single hot partition).

---

## 3. Pattern → operation mapping

| # | Operation |
|---|-----------|
| 1 | `GetItem(PK=EVENT#<eid>, SK=META)` |
| 2 | `Query(PK=EVENT#<eid>, SK begins_with "SHIFT#")` |
| 3 | `Query(PK=EVENT#<eid>, SK begins_with "ATT#")` + AppSync subscription `onAttendanceChanged(eventId)` |
| 4 | `Query(GSI1, GSI1PK=USER#<uid>, GSI1SK begins_with "ASSIGN#")` |
| 5 | `GetItem(PK=EVENT#<eid>, SK=ASSIGN#<uid>)` |
| 6 | `Query(GSI1, GSI1PK=USER#<uid>, GSI1SK begins_with "ATT#", ScanIndexForward=false)` |
| 7 | `GetItem(PK=USER#<uid>, SK=ACTIVE_CHECKIN)` |
| 8 | `Query(GSI2, GSI2PK=CODE#<code>)` |
| 9 | `Query(GSI3, GSI3PK=ORG#<oid>, GSI3SK >= "DATE#<today>")` |
| 10 | `Query(GSI1, GSI1PK=USER#<uid>, GSI1SK begins_with "MEMBER#")` |

---

## 4. Server-authority writes (Lambda resolvers)

These enforce invariants the Firestore client used to check racily — they move into
transactional Lambda resolvers behind AppSync.

- **Check in** — `TransactWriteItems`:
  1. `Put` Attendance item.
  2. `Put` `ACTIVE_CHECKIN` pointer with `ConditionExpression: attribute_not_exists(PK)`.
  A second concurrent check-in fails the condition → surface "already checked in to a shift"
  (replaces `getActiveCheckIn` pre-read in `attendance.ts`).

- **Check out** — `TransactWriteItems`:
  1. `Update` Attendance `status=checked-out`, set `checkOut.ts`.
  2. `Delete` the `ACTIVE_CHECKIN` pointer.

- **Sign up for shift** — `Put` Assignment with `attribute_not_exists` to block duplicates;
  optionally `Update` a shift counter and flip `status` open→full when `requiredVolunteers` met.

Each mutation returns the changed Attendance/Shift, and the check-in / check-out mutations
publish to the `onAttendanceChanged(eventId)` subscription so the coordinator dashboard
(pattern 3) updates live.

---

## 5. Auth (enforced at AppSync, not the table)

- Cognito groups `Coordinator` / `Volunteer` map to `UserRole`.
- Volunteers: can write their own Attendance (`volunteerId == $ctx.identity.sub`) and read
  their own USER# items.
- Coordinators: read all `EVENT#<eid>` children for events they hold a `Membership` on;
  manage shifts.
- Group directives on the schema + owner/resolver checks; no row-level rules in DynamoDB.

---

## 6. Open questions before coding the schema

- **Tenancy**: is `organizationId` always present? GSI3 assumes it. If events can be
  org-less, use a constant `GSI3PK=EVENTS` (accept a hotter partition at learning scale).
- **Attendance SK**: `ATT#<sid>#<uid>` assumes one attendance record per volunteer per shift.
  If re-check-in should create history, switch to `ATT#<ts>` and drop uniqueness.
- **Event-code collisions**: GSI2 lookup assumes codes are unique; enforce on event create.
