---
sidebar_position: 8
title: Replace eSIM (new number)
---

import LlmPrompt from '@site/src/components/LlmPrompt';

# Replace eSIM (new number)

Swap a phone-number line for a **new number, free of charge** — for when the number your customer received is still registered to someone else's WhatsApp, Telegram or Apple ID.

:::info Rules
- Phone-number lines only, **within 3 days of purchase**, and **once per order**. Anything more goes through support.
- The old eSIM **stops working**. Your customer must install the new eSIM (new QR code / activation code).
:::

## Endpoints

```
GET  /api/v1/business/esims/replace?iccid=<iccid>   (can it be replaced now?)
POST /api/v1/business/esims/replace                  (replace)
```

<LlmPrompt id="replace-esim" />

## Authentication

This endpoint requires HMAC authentication. See [Authentication](/docs/api-authentication) for details.

## Check eligibility (GET)

Query parameters: `iccid`, or `esimId` instead.

```json
{
  "success": true,
  "data": {
    "iccid": "8944110068223459012",
    "esimId": 33796,
    "replaceable": true,
    "reason": null,
    "availableUntil": "2026-11-29T10:12:00.000Z"
  }
}
```

## Replace (POST)

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| iccid | String | Yes* | The ICCID of the line to replace |
| esimId | Integer | Yes* | The eSIM `id` (used if `iccid` is not provided) |
| reason | String | No | Why (max 300 characters), e.g. `"Number linked to another WhatsApp account"` |

\* Provide **either** `iccid` or `esimId`.

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Number replaced. Install the new eSIM - the old one no longer works.",
  "data": {
    "previous": { "iccid": "8944110068223459012", "esimId": 33796, "phoneNumber": "447874273393" },
    "esim": {
      "iccid": "8944110068223460871",
      "esimId": 33812,
      "phoneNumber": "447874281120",
      "activationCode": "LPA:1$smdp.example.com$ABCD-1234",
      "qrCodeUrl": "data:image/png;base64,iVBORw0KGgo...",
      "appleInstallUrl": "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=...",
      "androidInstallUrl": "https://esimsetup.android.com/esim_qrcode_provisioning?carddata=...",
      "expiresAt": "2026-12-28T09:40:00.000Z"
    },
    "duplicate": false
  }
}
```

The new line takes over the order: order lookups, usage and renewals now refer to the new eSIM. Store the new `iccid` / `esimId` and deliver the new activation code to your customer.

`duplicate: true` means this line was already replaced (for example, you retried after a timeout); the same new line is returned and nothing new is bought.

## Error Responses

| HTTP | code | When |
|------|------|------|
| 400 | MISSING_IDENTIFIER | Neither `iccid` nor `esimId` |
| 400 | NOT_REPLACEABLE | Not allowed now — see `message` (e.g. more than 3 days after purchase, line cancelled, no new numbers available) |
| 403 | ACCOUNT_SUSPENDED | The account is suspended |
| 404 | ESIM_NOT_FOUND | Not your eSIM, or not a phone-number line |
| 409 | REPLACE_LIMIT | Already replaced once on this order — contact support |
| 409 | REPLACE_IN_PROGRESS | A replacement of this line is running right now |
| 500/502 | REPLACE_FAILED | No new number could be issued; your current number still works |
