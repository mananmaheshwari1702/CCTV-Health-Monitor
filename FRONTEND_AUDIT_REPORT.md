# Frontend Audit Report — CCTV Health Monitor

> **Scope**: Full frontend codebase — 13 pages, 2 auth components, 3 context/hook files, types, and `index.html`
> **Date**: February 2026 &nbsp;|&nbsp; **Mode**: Read-only (no code changes applied)

---

## Severity Legend

| Icon | Level | Meaning |
|------|-------|---------|
| 🔴 | **Critical** | Broken functionality or exploitable security flaw |
| 🟠 | **High** | Significant logic bug or data-integrity risk |
| 🟡 | **Medium** | Code-quality, UX, or moderate correctness issue |
| 🟢 | **Low** | Best-practice suggestion or minor improvement |

---

## 1 — Security Vulnerabilities

### 🔴 SEC-01: DeviceDetail reads raw mock data, bypassing role-based filtering

[DeviceDetail.tsx](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/pages/DeviceDetail.tsx#L40-L42)

```ts
import { devices, tickets, deviceCameras, … } from '../data/mockData';
const device  = devices.find(d => d.id === deviceId);
const deviceTickets = tickets.filter(t => t.deviceId === deviceId);
```

This page imports **raw arrays** directly from `mockData` instead of consuming `useData()`. Any user who navigates to `/devices/:id` can see **all devices and tickets** regardless of role or site assignment — completely bypassing the role-filtered data in `DataContext`.

> **Fix**: Replace all `mockData` imports with `useData()` hooks (`devices`, `tickets`). Camera/stats/timeline data should also be served through the context or a dedicated hook.

---

### 🟠 SEC-02: PermissionGuard doesn't enforce admin bypass consistently

[PermissionGuard.tsx](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/components/auth/PermissionGuard.tsx#L32-L37)

```ts
if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
        return <>{fallback}</>;
    }
}
```

Unlike `useAuth.hasPermission` (which auto-grants for `admin`), `PermissionGuard` performs a **strict role match**. If a developer writes `<PermissionGuard requiredRole={['manager']}>…` the admin is **blocked**. The two systems contradict each other.

> **Fix**: Add `if (user.role === 'admin') return <>{children}</>` at the top of the guard, or always include `'admin'` in every `requiredRole` array. Pick one model and enforce it.

---

### 🟠 SEC-03: `hasPermission` doesn't handle array of roles correctly

[useAuth.tsx](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/hooks/useAuth.tsx)

```ts
const hasPermission = (requiredRole: UserRole | UserRole[]) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === requiredRole; // ← strict equality on array
};
```

When passed an **array**, `user.role === requiredRole` always returns `false` for non-admin users because it compares a string to an array. This means `hasPermission(['manager', 'technician'])` silently fails for managers and technicians.

> **Fix**: `const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]; return roles.includes(user.role);`

---

### 🟡 SEC-04: Reports page has no role guard at the page level

[Reports.tsx](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/pages/Reports.tsx)

The route is protected in `App.tsx` (`allowedRoles: ['admin', 'manager']`), but the page component itself has **no** `PermissionGuard` wrapper. If routing is ever restructured, the page has zero self-defense.

> Also, the "Generate Now" and "Download Last" buttons have **no permission checks** — any authenticated user who accesses the page can trigger them.

---

### 🟡 SEC-05: CSP allows `'unsafe-inline'` for scripts

[index.html](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/index.html#L8-L9)

```
script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'
```

`'unsafe-inline'` in `script-src` **completely negates** XSS protection from the CSP. This is required by Vite's dev server, but a production build must drop it and use nonce-based scripts.

> **Fix**: Split CSP between dev and prod. For production, use `script-src 'self'` with SRI hashes or nonces.

---

### 🟡 SEC-06: ID generation uses `Date.now()` + `Math.random()`

Affected files:
- [Devices.tsx:130](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/pages/Devices.tsx#L130) — `dev-${Date.now()}`
- [DeviceDetail.tsx:187](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/pages/DeviceDetail.tsx#L187) — `tkt-${Date.now()}`
- [TicketDetail.tsx:41](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/pages/TicketDetail.tsx#L41) — `cm-${Date.now()}`

While `Tickets.tsx` was fixed to use `crypto.randomUUID()`, these other files still use the old insecure pattern. IDs are predictable and may collide.

> **Fix**: Use `crypto.randomUUID()` everywhere, or create a shared `generateId(prefix)` utility.

---

## 2 — State Management & Data Integrity

### 🔴 BUG-01: DeviceDetail data is stale / disconnected from context

Same root cause as SEC-01. Because `DeviceDetail` reads from raw imports:
- **Tickets created on the detail page** (via the missing-recording modal) call `addTicket` on `DataContext`, but the `deviceTickets` list doesn't update — it's derived from the immutable import.
- **Device status changes** made elsewhere in the app are invisible here.
- A user can create a "Missing Recording" ticket and never see it in the "Related Tickets" section.

---

### 🟠 BUG-02: Dashboard `avgResponseTime` doesn't respect filters

[Dashboard.tsx](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/pages/Dashboard.tsx)

The filteredData memoization recalculates `totalDevices`, `onlineDevices`, `activeAlerts`, etc. based on filters, but `avgResponseTime` comes from the global `dashboardStats` object — even when site/status filters are active. This shows misleading analytics.

> **Fix**: Recompute `avgResponseTime` inside the `filteredData` memo using only the filtered ticket set.

---

### 🟠 BUG-03: Devices.tsx status summary cards ignore filters

[Devices.tsx:208-216](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/pages/Devices.tsx#L208-L216)

```ts
const statusCounts = useMemo(() => {
    const counts = { total: devices.length, online: 0, … };
    devices.forEach(…); // ← uses unfiltered `devices`
    return counts;
}, [devices]);
```

The summary cards (Total / Online / Offline / Warning) always show **unfiltered** totals, even when site or status filters are active. The table below shows filtered data, creating a visual mismatch.

> **Fix**: Derive `statusCounts` from `filteredDevices` instead of `devices`.

---

### 🟠 BUG-04: Shallow merge in `updateSettings` silently drops keys

[DataContext.tsx](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/context/DataContext.tsx)

The `updateSettings` function uses spread at only one level of depth. Updating `settings.notifications.emailAlerts` will **overwrite** the entire `notifications` object, dropping `smsAlerts`, `pushNotifications`, etc.

> **Fix**: Use a deep-merge utility or per-section update functions (already partially addressed in `Settings.tsx` handlers, but the context itself is still vulnerable if called directly).

---

### 🟡 BUG-05: Pagination not reset when data changes

Pages affected: `Tickets.tsx`, `Alerts.tsx`

When a ticket/alert is deleted from a later page, `currentPage` can become invalid (pointing beyond the new `totalPages`). The user sees an empty page until they manually navigate back.

> **Fix**: Add a `useEffect` that clamps `currentPage` to `[1, totalPages]` whenever the data length changes.

---

### 🟡 BUG-06: `formData` in Devices defaults to first site at mount time

[Devices.tsx:79](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/pages/Devices.tsx#L79)

```ts
siteId: sites[0]?.id || ''
```

If `sites` is still loading or empty when the component mounts, the default is `''`. Later, when sites arrive, the default isn't updated. The user opens the "Add Device" modal with **no site selected** and the form silently submits with an empty `siteId`.

> **Fix**: Initialize `siteId` in `handleOpenModal` (or `resetForm`) at open-time, not at mount-time.

---

## 3 — Logic Errors

### 🟡 LOGIC-01: Ticket badge in DeviceDetail only shows `danger` or `warning`

[DeviceDetail.tsx:656-660](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/pages/DeviceDetail.tsx#L656-L660)

```ts
variant={ticket.priority === 'critical' ? 'danger' : 'warning'}
```

Priorities can be `low`, `medium`, `high`, or `critical`, but only two badge variants are used. `low` and `medium` tickets are **both** rendered as `warning`, which is misleading.

---

### 🟡 LOGIC-02: Reports quick stats are fully hardcoded

[Reports.tsx:87-127](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/pages/Reports.tsx#L87-L127)

Values like "24 Reports Generated", "156 Total Downloads", "2h ago" are static JSX literals. They never change and provide false information to users.

> **Fix**: Either connect to real report metadata or clearly label them as demo data.

---

### 🟡 LOGIC-03: Device type dropdown options mismatch type definitions

[Devices.tsx:507-511](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/pages/Devices.tsx#L507-L511)

The dropdown offers `camera`, `nvr`, `server`, but the `Device` type expects `'camera' | 'nvr' | 'dvr' | 'switch'`. `dvr` and `switch` are missing; `server` isn't a valid type. This creates data that doesn't match the type icons on line 45–50.

---

## 4 — Performance Concerns

### 🟡 PERF-01: DataContext re-renders all consumers on any state change

`DataContext` holds **seven** pieces of state in a single provider. Any call to `addTicket`, `updateAlert`, etc. triggers a re-render of **every** consumer (`Dashboard`, `Tickets`, `Alerts`, `Sites`, `Devices`, etc.) — even if they only care about one slice.

> **Fix**: Split into domain-specific contexts (e.g., `TicketContext`, `AlertContext`, `DeviceContext`) or use `useSyncExternalStore` / state selection libraries.

---

### 🟡 PERF-02: DeviceDetail calendar renders 31 × N buttons every render

The recording calendar grid renders `cameras.length × daysInMonth` interactive buttons. For 8 cameras and 31 days = 248 buttons per render. The `recordingDataMap` optimization helps lookup, but each button still creates a tooltip div. Memoizing camera rows would reduce re-render cost.

---

### 🟢 PERF-03: Profile re-initializes form state on every render

[Profile.tsx](file:///c:/Users/User/Desktop/Projects/CCTV%20Health%20Monitor/src/pages/Profile.tsx)

`formData` is re-derived from `user` on every render cycle. Should be initialized once with `useEffect` on `user` changes.

---

## 5 — Missing Test Coverage

> **No test files were found** (`*.test.*`, `*.spec.*`) in the entire `src/` directory.

There are zero unit, integration, or e2e tests for:
- Authentication flow and role checks
- DataContext CRUD operations and filtering
- PermissionGuard rendering logic
- Pagination edge cases
- Form validation (Login password policy, device/ticket creation)

> **Recommendation**: Prioritize tests for:
> 1. `PermissionGuard` role logic (especially admin bypass)
> 2. `DataContext` filtering and CRUD
> 3. `Login` password validation + 2FA flow
> 4. Pagination boundary conditions

---

## 6 — Summary Table

| ID | Severity | Category | File | Summary |
|----|----------|----------|------|---------|
| SEC-01 | 🔴 Critical | Security | `DeviceDetail.tsx` | Reads raw mock data, bypassing role-based filtering |
| BUG-01 | 🔴 Critical | State | `DeviceDetail.tsx` | Created tickets invisible in related tickets list |
| SEC-02 | 🟠 High | Security | `PermissionGuard.tsx` | Admin bypass not enforced; contradicts `hasPermission` |
| SEC-03 | 🟠 High | Security | `useAuth.tsx` | `hasPermission` broken for array of roles |
| BUG-02 | 🟠 High | Data | `Dashboard.tsx` | `avgResponseTime` ignores active filters |
| BUG-03 | 🟠 High | Data | `Devices.tsx` | Status summary cards show unfiltered totals |
| BUG-04 | 🟠 High | State | `DataContext.tsx` | Shallow merge drops nested settings keys |
| SEC-04 | 🟡 Medium | Security | `Reports.tsx` | No page-level permission guard |
| SEC-05 | 🟡 Medium | Security | `index.html` | CSP allows `unsafe-inline` for scripts |
| SEC-06 | 🟡 Medium | Security | Multiple | Insecure ID generation in 3 files |
| BUG-05 | 🟡 Medium | State | Tickets/Alerts | Pagination not clamped after deletion |
| BUG-06 | 🟡 Medium | State | `Devices.tsx` | Form defaults to first site at mount, not open |
| LOGIC-01 | 🟡 Medium | Logic | `DeviceDetail.tsx` | Priority badge only maps 2 of 4 priorities |
| LOGIC-02 | 🟡 Medium | Logic | `Reports.tsx` | Quick stats fully hardcoded |
| LOGIC-03 | 🟡 Medium | Logic | `Devices.tsx` | Type dropdown options don't match type definitions |
| PERF-01 | 🟡 Medium | Perf | `DataContext.tsx` | Single context re-renders all consumers |
| PERF-02 | 🟡 Medium | Perf | `DeviceDetail.tsx` | Calendar renders hundreds of buttons |
| PERF-03 | 🟢 Low | Perf | `Profile.tsx` | Form state re-initialized every render |
| — | 🔴 Critical | Testing | `src/` | Zero test files in the entire codebase |

---

## Recommended Fix Priority

1. **SEC-01 + BUG-01** — Migrate `DeviceDetail` to `useData()` context (critical data leak + stale state)
2. **SEC-03** — Fix `hasPermission` array handling (breaks non-admin role checks)
3. **SEC-02** — Align `PermissionGuard` with admin-bypass policy
4. **BUG-04** — Implement deep merge for settings updates
5. **BUG-02 + BUG-03** — Fix filtered stats on Dashboard and Devices pages
6. **SEC-06** — Create shared `generateId()` utility
7. **Testing** — Add tests for auth, permissions, and CRUD operations
