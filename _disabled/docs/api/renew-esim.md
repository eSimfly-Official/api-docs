---
sidebar_position: 7
title: Renew eSIM
---

import LlmPrompt from '@site/src/components/LlmPrompt';

# Renew eSIM

Renew a phone-number line by one more period (usually 30 days), paid from your wallet.

:::info Phone-number lines only
Only packages with `can_extend: true` in [Get All Packages](/docs/api/packages) can be renewed. Lines are sold for one period at a time; renew them here, or switch on [Auto-renew](/docs/api/auto-renew) to have it done every month.
:::

## Endpoints

```
GET  /api/v1/business/esims/renew?iccid=<iccid>     (price and eligibility — nothing is charged)
POST /api/v1/business/esims/renew                    (renew)
```

<LlmPrompt id="renew-esim" />

## Authentication

This endpoint requires HMAC authentication. See [Authentication](/docs/api-authentication) for details.

## Check price and eligibility (GET)

Query parameters: `iccid`, or `esimId` instead.

```json
{
  "success": true,
  "data": {
    "iccid": "8944110068223459012",
    "esimId": 33796,
    "renewable": true,
    "reason": null,
    "price": 8.34,
    "currency": "USD",
    "days": 30,
    "expiresAt": "2026-12-25T10:12:00.000Z",
    "pendingRenewal": false
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| renewable | Boolean | Whether a renewal can be bought now |
| reason | String/null | Why not, when `renewable` is `false` |
| price | Number | Price of one renewal in your wallet currency |
| currency | String | Your wallet currency |
| days | Integer | Days one renewal adds |
| expiresAt | String/null | Current expiry (ISO 8601) |
| pendingRenewal | Boolean | A paid renewal of this line is still being completed — do not renew again |

A line can be renewed until **7 days after it expired**; after that, buy a new line.

## Renew (POST)

### Request Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| RT-AccessCode, RT-RequestID, RT-Timestamp, RT-Signature | String | Yes | See [Authentication](/docs/api-authentication) |
| Content-Type | String | Yes | Must be "application/json" |
| Idempotency-Key | String | Recommended | Your own id for this renewal (max 100 characters). A retry with the same key returns the first renewal instead of charging again. You may send it as `idempotencyKey` in the body instead |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| iccid | String | Yes* | The ICCID of the line |
| esimId | Integer | Yes* | The eSIM `id` (used if `iccid` is not provided) |

\* Provide **either** `iccid` or `esimId`.

```json
{ "iccid": "8944110068223459012" }
```

### Success Response (200 OK) — renewed

```json
{
  "success": true,
  "message": "eSIM renewed",
  "data": {
    "status": "completed",
    "iccid": "8944110068223459012",
    "esimId": 33796,
    "renewalReference": "business_renewal_1795612345678_ab1cd",
    "orderId": 51234,
    "newExpiryDate": "2027-01-24T10:12:00.000Z",
    "amount": 8.34,
    "currency": "USD",
    "duplicate": false
  }
}
```

### Accepted (202) — paid, being completed

Rarely the network does not confirm the extension straight away. The renewal is then **paid and held**: our team completes the extension (or refunds your wallet), and the new expiry appears on the eSIM once it is done. Do not renew again — a new attempt returns `RENEWAL_PENDING` until it is settled.

```json
{
  "success": true,
  "message": "Payment received. The line is being extended by our team - the new expiry appears on the eSIM once it is done.",
  "data": { "status": "processing", "iccid": "8944110068223459012", "esimId": 33796, "renewalReference": "business_renewal_1795612345678_ab1cd", "orderId": 51234, "newExpiryDate": null, "amount": 8.34, "currency": "USD", "duplicate": false }
}
```

`duplicate: true` means the same `Idempotency-Key` was already processed; the first renewal is returned and nothing is charged again.

## Error Responses

| HTTP | code | When |
|------|------|------|
| 400 | MISSING_IDENTIFIER | Neither `iccid` nor `esimId` |
| 400 | NOT_RENEWABLE | The line cannot be renewed (see `message`, e.g. expired more than 7 days ago) |
| 400 | INSUFFICIENT_BALANCE | Wallet too low; includes `currentBalance`, `requiredBalance`, `currency` |
| 403 | ACCOUNT_SUSPENDED | The account is suspended |
| 404 | ESIM_NOT_FOUND | Not your eSIM, or not a renewable line |
| 409 | RENEWAL_IN_PROGRESS | Another renewal of this line is running right now |
| 409 | RENEWAL_PENDING | A paid renewal of this line is still being completed |
| 500/502 | RENEW_FAILED | Nothing was charged, or the charge was refunded |

```json
{ "success": false, "message": "Insufficient USD balance. Required: 8.34, Available: 2.10", "code": "INSUFFICIENT_BALANCE", "currentBalance": 2.1, "requiredBalance": 8.34, "currency": "USD" }
```

## Notes

- Call GET first to show the price; POST charges the current price.
- Always send an `Idempotency-Key` so a network retry can never renew twice.
- To renew every month without calling this endpoint, use [Auto-renew](/docs/api/auto-renew).
