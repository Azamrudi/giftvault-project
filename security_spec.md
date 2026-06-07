# Firestore Security Rules Specification

This document details the high-assurance security policies, invariants, and "Dirty Dozen" penetration-testing payloads for GiftVault's Firestore collections.

## 1. Core Data Invariants

1. **User Ownership & Integrity**: Users can only create or edit their own profile document (`/users/{userId}`). Writing to another user's profile is forbidden.
2. **Capsule Isolation (Creator Privileges)**: Only authenticated users can create a `BirthdayPage`. After creation, only the original creator (`creatorUid`) can modify or delete the Capsule (except for atomic guest book adjustments allowed to public).
3. **Immutability of Key Metadata**: Fields such as `id`, `creatorUid`, `createdAt` on any capsule cannot be modified after creation.
4. **Strict Temporal Ordering**: `createdAt` and `lastOpened` timestamps must strictly align with the server's time (`request.time`).
5. **Secure Visibility**:
   - Private and Semi-Private pages should not leak detailed content before unlocking.
   - For listing (Global Birthday Wall), queries are strictly guarded or limited. Specifically only public or semi-private records can be listed.
6. **Passcode Integrity**: To view or access a locked capsule, the client must present the matching path variable and query parameters, and the server rules validate the payload matches if requested.
7. **Bilinear Validation**: All inputs are checked against exact shapes, max sizes (e.g., recipientName <= 100 characters), and regex rules.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads represent attack scenarios that must be rejected (`PERMISSION_DENIED`) by Firestore security rules.

### Payload 1: Identity Impersonation (Spoofing User Profile Creation)
- **Path**: `/users/legit-user-id`
- **Scenarios**: attacker tries to write profile for another user (`legit-user-id`) with their own auth.
- **Malicious Payload**:
  ```json
  {
    "uid": "legit-user-id",
    "displayName": "Injected Identity",
    "email": "hacker@spoof.com",
    "createdAt": "2026-06-06T18:42:00Z"
  }
  ```
- **Reason to Deny**: Auth user UID does not match the document path.

### Payload 2: Self-Assembling Unlocked State (State Bypass)
- **Path**: `/birthdayPages/newpage`
- **Scenario**: Attacker creates a capsule that is pre-unlocked or sets its creator to someone else.
- **Malicious Payload**:
  ```json
  {
    "id": "newpage",
    "creatorUid": "other-user",
    "recipientName": "Anil",
    "birthdayDate": "2000-01-01",
    "unlockDateTimeUTC": "1990-01-01T00:00:00Z",
    "accessCode": "HACK",
    "visibility": "public",
    "theme": "elegant",
    "title": "Hacked",
    "message": "Content",
    "createdAt": "1990-01-01T00:00:00Z"
  }
  ```
- **Reason to Deny**: `creatorUid` does not match active authenticated user, and `createdAt` is backdated instead of hitting `request.time`.

### Payload 3: Capsule Creator Jacking (Privilege Escalation)
- **Path**: `/birthdayPages/existing-capsule`
- **Scenario**: Existing capsule created by `user-1` is updated by `user-2` to change its `creatorUid`.
- **Malicious Payload**:
  ```json
  {
    "creatorUid": "hacker-uid"
  }
  ```
- **Reason to Deny**: Updates of `creatorUid` must be rejected as immutable.

### Payload 4: Resource Poisoning (Denial of Wallet via Oversized Fields)
- **Path**: `/birthdayPages/evil-page`
- **Scenario**: Attacker attempts to create a capsule with a giant biography, exceeding storage limits.
- **Malicious Payload**:
  ```json
  {
    "recipientName": "A...[Repeated 100,000 times]",
    "title": "My Card"
  }
  ```
- **Reason to Deny**: Enforce bounds like `incoming().recipientName.size() <= 100`.

### Payload 5: ID Poisoning (Path Injection)
- **Path**: `/birthdayPages/evil%-page-with-bad-chars-$$$`
- **Scenario**: Attacker injects a malicious or very long string to exploit indexing or routing engines.
- **Reason to Deny**: ID must conform to regex `^[a-zA-Z0-9_\-]+$`.

### Payload 6: Message Hijacking in Friend Contributions (Impersonating Writer)
- **Path**: `/friendContributions/msg-1`
- **Scenario**: Attacker tries to insert list notes without a valid `pageId` reference or tries to modify another friend's note.
- **Reason to Deny**: The rules must verify the target `BirthdayPage` exists and updates are denied.

### Payload 7: Secret Code Overwrite (Stealing Locked Card)
- **Path**: `/birthdayPages/secret-page`
- **Scenario**: Attacker updates a public or unlisted page to change the `accessCode` to locked-out values.
- **Reason to Deny**: Non-creator users are blocked from updating ANY field in `/birthdayPages/secret-page`.

### Payload 8: Guestbook State Bypass (Spamming Guestbook before Unlocks)
- **Path**: `/guestbook/entry-1`
- **Scenario**: Attacker adds guestbook entries to a private page before the countdown officially unlocks.
- **Reason to Deny**: Cannot write guestbook entry if the `BirthdayPage` `unlockDateTimeUTC` is in the future.

### Payload 9: Temporal Integrity Tampering (Backdating updates)
- **Path**: `/birthdayPages/page-1`
- **Scenario**: Creator tries to change `lastOpened` to a fake historic date.
- **Reason to Deny**: `lastOpened` must strictly match `request.time`.

### Payload 10: Anonymous Read Harvesting (PII Leakage)
- **Path**: `/birthdayPages/private-capsule`
- **Scenario**: Unauthenticated visitor tries to do a bulk list query on all private capsules.
- **Reason to Deny**: Blanket reads are denied. Rules require matching `creatorUid` or a valid passcode context.

### Payload 11: Ghost Fields Injection (Shadow Update)
- **Path**: `/birthdayPages/page-1`
- **Scenario**: User tries to update a capsule but inserts an extra key `isVerifiedSystemAdmin: true` to bypass administrative gates.
- **Reason to Deny**: Enforce `affectedKeys().hasOnly(...)` during updates.

### Payload 12: Relational Orphan Creation (Dangling Guestbook Entries)
- **Path**: `/guestbook/entry-999`
- **Scenario**: Attacker inserts a guestbook entry referring to `pageId: "nonexistent-page-id"`.
- **Reason to Deny**: Rules assert that the referred document exists before allowing creation of sub-documents.

---

## 3. Test Verification Rules

We declare that during our compilation and deployment, any incoming payload that does not satisfy these structural boundary invariants will be rejected by our active ruleset.
