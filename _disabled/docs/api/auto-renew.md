---
sidebar_position: 9
title: Auto-renew
---

import LlmPrompt from '@site/src/components/LlmPrompt';

# Auto-renew

Keep phone-number lines active by renewing them **every month from your wallet**. Off by default — switch it on per line, or as the default for every line on your account.

## How it works

- From **2 days before** a line expires, it is renewed by one period through the same flow as [Renew eSIM](/docs/api/renew-esim) (wallet charged first).
- If your wallet is short, your account email gets **one warning per period** (from 3 days before expiry), and renewal is retried until the expiry date. After that the line runs out. Auto-renew stays on, so it picks up again once you top up.
- Only lines with `can_extend: true` can auto-renew.

You can also switch it on when ordering: `POST /esims/order` with `"autoRenew": true` (see [Create Order](/docs/api/create-order)).

## Endpoints

```
GET  /api/v1/business/esims/auto-renew?iccid=<iccid>   (one line)
GET  /api/v1/business/esims/auto-renew                 (your account default)
POST /api/v1/business/esims/auto-renew                 (change a line or the account default)
```

<LlmPrompt id="auto-renew" />

## Authentication

This endpoint requires HMAC authentication. See [Authentication](/docs/api-authentication) for details.

## Request Body (POST)

**One line** — `enabled`: `true`, `false`, or `null` to follow the account default:
```json
{ "iccid": "8944110068223459012", "enabled": true }
```

**Account default** — every line that has no setting of its own:
```json
{ "accountDefault": true }
```

## Response

**Line:**
```json
{
  "success": true,
  "data": {
    "iccid": "8944110068223459012",
    "esimId": 33796,
    "autoRenew": true,
    "lineSetting": true,
    "accountDefault": false,
    "expiresAt": "2026-12-25T10:12:00.000Z",
    "nextRenewalFrom": "2026-12-23T10:12:00.000Z",
    "lastResult": null,
    "lastAttemptAt": null
  }
}
```

**Account default (GET without identifier, or POST `accountDefault`):**
```json
{ "success": true, "data": { "accountDefault": true } }
```

| Field | Type | Description |
|-------|------|-------------|
| autoRenew | Boolean | Whether this line will be renewed |
| lineSetting | Boolean/null | The line's own setting; `null` = follows `accountDefault` |
| accountDefault | Boolean | Your account default |
| expiresAt | String/null | Current expiry |
| nextRenewalFrom | String/null | When renewal attempts start (`null` when off) |
| lastResult | String/null | Last attempt: `renewed`, `pending`, `insufficient_balance`, `not_renewable` or `error` |
| lastAttemptAt | String/null | When it was |

## Error Responses

| HTTP | code | When |
|------|------|------|
| 400 | INVALID_REQUEST | Neither `enabled` nor `accountDefault` sent |
| 400 | MISSING_IDENTIFIER | `enabled` sent without `iccid` / `esimId` |
| 403 | ACCOUNT_SUSPENDED | The account is suspended |
| 404 | ESIM_NOT_FOUND | Not your eSIM, or the line cannot be renewed |
