# Firestore Security Specification — PP-203 Portal & Admin CMS

## 1. Data Invariants
1. Default-deny catch-all at root (`/{document=**} { allow read, write: if false; }`).
2. Public collections (`profile`, `projects`, `assembly_activities`, `news`, `gallery`, `public_notices`, `settings`) are read-only for unauthenticated visitors and writable only by verified active admins (`isAdmin()`).
3. `complaints/{complaintId}` allows public `create` only with strict schema validation (`isValidComplaint`), fixed initial `status == 'Received'`, and valid Tracking ID format (`isValidId(complaintId)`). Public `get` is permitted for single-document Tracking ID lookup; `list`, `update`, and `delete` are strictly restricted to active admins (`isAdmin()`).
4. `contact_messages/{messageId}` allows public `create` only with `status == 'Pending'` and strict field bounds (`isValidContactMessage`); all reads, updates, and deletes require `isAdmin()`.
5. `admins/{uid}` reads are restricted to the owner (`request.auth.uid == uid`) or active admins (`isAdmin()`); writes are strictly restricted to `isSuperAdmin()`.
6. `sms_logs/{logId}` is strictly readable and creatable only by `isAdmin()`, and cannot be modified or deleted.
7. `audit_logs/{logId}` is strictly readable and creatable only by `isAdmin()`, and `update`/`delete` are unconditionally `false` (immutable).
8. Bootstrapped Super Admin (`hasanaamir815@gmail.com`) is authorized ONLY when `request.auth.token.email_verified == true`.

## 2. Adversarial Payloads Tested ("Dirty Dozen")
1. **Unauthenticated `list` on `/complaints`**: Blocked (`allow list: if isAdmin()`).
2. **Ghost field injection on `/complaints` create** (`{ ..., "isAdmin": true }`): Blocked (`keys().hasOnly(...)`).
3. **Status shortcutting on `/complaints` create** (`{ ..., "status": "Resolved" }`): Blocked (`data.status == 'Received'`).
4. **Oversized 1MB string on `/complaints` description or ID**: Blocked (`isValidId` + `.size() <= 2500`).
5. **Email spoofing on Super Admin** (`email == 'hasanaamir815@gmail.com'` with `email_verified == false`): Blocked (`email_verified == true`).
6. **Privilege escalation on `/admins/{uid}` self-write** (`role: 'Super Admin'`): Blocked (`allow write: if isSuperAdmin()`).
7. **Audit log tampering (`update` or `delete` on `/audit_logs/{id}`)**: Blocked (`allow update, delete: if false`).
8. **Unauthenticated read on `/contact_messages`**: Blocked (`allow read: if isAdmin()`).
9. **Status tampering on `/contact_messages` create** (`status: 'Completed'`): Blocked (`data.status == 'Pending'`).
10. **Unauthenticated write on `/settings/portal`**: Blocked (`allow write: if isAdmin()`).
11. **Non-admin read on `/sms_logs`**: Blocked (`allow read: if isAdmin()`).
12. **Suspended admin write attempt** (`admins/{uid}.status == 'Suspended'`): Blocked (`adminData.status == 'Active'`).
