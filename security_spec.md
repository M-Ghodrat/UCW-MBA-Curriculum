# Security Specification: MBA Curriculum Mapper

This document outlines the security invariants, malicious payloads, and authorization rules designed to secure the database of the UCW MBA Curriculum Mapping application.

## 1. Data Invariants

- **Identity**:
  - Anyone can read the program structure (courses, PLOs, CLOs, assignments, settings, and active mappings) because this is public curriculum information.
  - Writing or updating curriculum, mappings, or student data is restricted to authenticated users.
  - Student records contain emails and private scores. Standard public read of student data is blocked. Reads are restricted to the owner of the record or an administrator.
  - Administrators (trusted users specified in the `admins` collection) have read and write privileges on all documents.

- **Integrity**:
  - PLO IDs must match `^[a-zA-Z0-9_\-]+$` and have a length `<= 128`.
  - Every PLO must have a single action verb and a text field.
  - Courses must fall within Terms 1-4.
  - Mappings must only contains lists of valid PLO IDs.
  - Updated timestamps must strictly match `request.time`.

## 2. The "Dirty Dozen" Payloads (Malicious Writes Rejected)

1. **Self-Appointed Administrator (Identity Escalation)**
   - Target: `/admins/attacker_uid`
   - Payload: `{ "email": "attacker@spam.com", "isAdmin": true }`
   - Expected: `PERMISSION_DENIED` (No self-creation in admins)

2. **Poisoned PLO ID (Resource Exhaustion)**
   - Target: `/plos/PLO_VERY_LONG_GARBAGE_ID_EXCEEDING_SIZE_LIMIT`
   - Expected: `PERMISSION_DENIED` (`isValidId` fails size check)

3. **Curriculum Tampering by Unauthenticated Client (Access Failure)**
   - Target: `/courses/BUSI601`
   - Payload: `{ "name": "Hacked Course Name" }`
   - Expected: `PERMISSION_DENIED` (Requires active authenticated session)

4. **Malicious Ghost Field Insertion in Courses (Shadow Update)**
   - Target: `/courses/BUSI601`
   - Payload: `{ "id": "BUSI601", "code": "BUSI 601", "name": "Ethics", "term": 1, "clos": [], "ghostField": "unwanted_data" }`
   - Expected: `PERMISSION_DENIED` (`affectedKeys().hasOnly(...)` rejects ghost field)

5. **PLO Verb Erasure (Schema Violation)**
   - Target: `/plos/PLO1`
   - Payload: `{ "id": "PLO1", "text": "Valid Text", "bloomLevel": "Apply", "order": 1 }` (Missing `verb`)
   - Expected: `PERMISSION_DENIED` (Fails required schema check)

6. **Forged Client Timestamp (Temporal Invariant)**
   - Target: `/settings/general`
   - Payload: `{ "id": "general", "thresholdTerm": 3, "thresholdProgram": 5, "updatedAt": "2020-01-01T00:00:00Z" }`
   - Expected: `PERMISSION_DENIED` (`updatedAt == request.time` fails)

7. **Invalid Term Boundary Injection (Boundary Check)**
   - Target: `/courses/BUSI601`
   - Payload: `{ "id": "BUSI601", "code": "BUSI 601", "name": "Ethics", "term": 99, "clos": [] }`
   - Expected: `PERMISSION_DENIED` (Term must be between 1 and 4)

8. **Blanket Read of Student Private Grades by Anonymous User (PII Leak)**
   - Target: `/students/student_john`
   - Expected: `PERMISSION_DENIED` (Only record owner or admin can read)

9. **Hijacking Other Student's Profile (Identity Spoofing)**
   - Target: `/students/student_john`
   - Payload: `{ "id": "student_john", "name": "Hacker", "email": "attacker@hacker.com", "grades": {} }` (Written by authenticated user `attacker_uid`)
   - Expected: `PERMISSION_DENIED` (`studentId == request.auth.uid` fails)

10. **State Shortcutting on Mappings (Access Failure)**
    - Target: `/mappings/active`
    - Payload: `{ "id": "active", "mappings": { "BUSI601_CLO1": ["PLO1"] } }` (Written by unauthenticated client)
    - Expected: `PERMISSION_DENIED` (Write requires authenticated user)

11. **Injecting Gigantic String in CLO (Denial of Wallet)**
    - Target: `/courses/BUSI601`
    - Payload: `{ "id": "BUSI601", "code": "BUSI 601", "name": "Ethics", "term": 1, "clos": [{ "id": "CLO1", "verb": "Verify", "text": "A".repeat(1000000) }] }`
    - Expected: `PERMISSION_DENIED` (CLO text must be within size limits)

12. **Array Boundary Exploit (Type Poisoning)**
    - Target: `/mappings/active`
    - Payload: `{ "id": "active", "mappings": { "BUSI601_CLO1": [123, true, null] } }`
    - Expected: `PERMISSION_DENIED` (PLO IDs in mappings must be strings)

## 3. Test Runner Concept

A local test suite using the `@firebase/rules-unit-testing` framework can be established to verify that the standard security rule matches block all of these vectors. All writes to the database of any schema entities will undergo strict verification against the validations defined in the security rules.
