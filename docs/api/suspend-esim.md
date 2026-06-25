---
sidebar_position: 6
title: Suspend / Activate eSIM
---

# Suspend / Activate eSIM

Block (suspend) or restore (activate) network access for an eSIM.

:::info eSIMfly packages only
This operation is only available for **eSIMfly** eSIMs, which expose subscriber-level network control. Calling it for any other provider returns `UNSUPPORTED_PROVIDER`.
:::

## Endpoint

```
POST /api/v1/business/esims/suspend
```

## Authentication

This endpoint requires HMAC authentication. See [Authentication](/docs/api-authentication) for details.

## Request Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| RT-AccessCode | String | Yes | Your API access code |
| RT-RequestID | String | Yes | Unique request ID (UUID v4) |
| RT-Timestamp | String | Yes | Request timestamp in milliseconds |
| RT-Signature | String | Yes | HMAC-SHA256 signature |
| Content-Type | String | Yes | Must be "application/json" |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| action | String | Yes | `"suspend"` to block network access, or `"activate"` to restore it |
| iccid | String | Yes* | The ICCID of the eSIM |
| esimId | Integer | Yes* | The eSIM `id` (used if `iccid` is not provided) |

\* Provide **either** `iccid` or `esimId`.

**Suspend:**
```json
{
  "iccid": "8948010010036785060",
  "action": "suspend"
}
```

**Activate:**
```json
{
  "iccid": "8948010010036785060",
  "action": "activate"
}
```

## Response

### Success Response (200 OK)

**Suspend:**
```json
{
  "success": true,
  "message": "eSIM suspended. Network access has been blocked.",
  "data": {
    "iccid": "8948010010036785060",
    "action": "suspend",
    "esim_status": "Disconnected"
  }
}
```

**Activate:**
```json
{
  "success": true,
  "message": "eSIM activated. Network access has been restored.",
  "data": {
    "iccid": "8948010010036785060",
    "action": "activate",
    "esim_status": "Active"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | Whether the status change succeeded |
| message | String | Human-readable result |
| data.iccid | String | The affected eSIM ICCID |
| data.action | String | The action performed (`suspend` / `activate`) |
| data.esim_status | String | New eSIM status (`Disconnected` when suspended, `Active` when activated) |

## Error Responses

### 400 Bad Request

Invalid action:
```json
{ "success": false, "message": "action must be \"suspend\" or \"activate\"", "code": "INVALID_ACTION" }
```

Missing identifier:
```json
{ "success": false, "message": "Provide either iccid or esimId", "code": "MISSING_IDENTIFIER" }
```

Unsupported provider:
```json
{ "success": false, "message": "Suspend/activate is only available for eSIMfly eSIMs", "code": "UNSUPPORTED_PROVIDER" }
```

### 404 Not Found

```json
{ "success": false, "message": "eSIM not found", "code": "ESIM_NOT_FOUND" }
```

## Example

```javascript
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

async function setEsimNetwork(iccid, action) { // action: 'suspend' | 'activate'
  const accessCode = 'esf_your_access_code';
  const secretKey = 'sk_your_secret_key';

  const body = JSON.stringify({ iccid, action });
  const timestamp = Date.now().toString();
  const requestId = uuidv4();
  const signData = timestamp + requestId + accessCode + body;
  const signature = crypto.createHmac('sha256', secretKey)
    .update(signData)
    .digest('hex')
    .toUpperCase();

  const response = await fetch('https://esimfly.net/api/v1/business/esims/suspend', {
    method: 'POST',
    headers: {
      'RT-AccessCode': accessCode,
      'RT-RequestID': requestId,
      'RT-Timestamp': timestamp,
      'RT-Signature': signature,
      'Content-Type': 'application/json'
    },
    body
  });

  return response.json();
}
```

## Notes

- **Suspend** blocks the eSIM from connecting to any network; **activate** restores it. The change takes effect on the carrier network shortly after the call succeeds.
- Suspending does **not** cancel the eSIM or refund anything — use [Cancel eSIM](/docs/api/cancel-esim) for that.
- An eSIM can be suspended and re-activated as many times as needed.
