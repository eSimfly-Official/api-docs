---
sidebar_position: 9
title: Send SMS
---

import LlmPrompt from '@site/src/components/LlmPrompt';

# Send SMS

Send an SMS message to one of your eSIMs. Useful for delivering setup instructions, alerts, or notices directly to the device.

:::note
SMS is supported on most eSIMs but not all. If the eSIM's network does not support messaging, the request returns `SMS_NOT_SUPPORTED`.
:::

## Endpoint

```
POST /api/v1/business/esims/send-sms
```

<LlmPrompt id="send-sms" />

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

Identify the eSIM by `iccid` (recommended) or `esimId`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| iccid | String | Yes* | The ICCID of the eSIM to message |
| esimId | Integer | Yes* | The eSIM `id` (from the eSIM list/order response). Used if `iccid` is not provided. |
| message | String | Yes | The SMS text. Max **500** characters. |

\* Provide **either** `iccid` or `esimId`.

```json
{
  "iccid": "8948010010036785060",
  "message": "Welcome! Your eSIM is ready to use."
}
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "SMS sent successfully"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | Whether the SMS was sent |
| message | String | Human-readable result |

### Error Responses

#### 400 Bad Request

Missing identifier:
```json
{ "success": false, "message": "Provide either iccid or esimId", "code": "MISSING_IDENTIFIER" }
```

Missing message:
```json
{ "success": false, "message": "Message is required", "code": "MISSING_MESSAGE" }
```

Message too long:
```json
{ "success": false, "message": "Message cannot exceed 500 characters", "code": "MESSAGE_TOO_LONG" }
```

SMS not supported for this eSIM:
```json
{ "success": false, "message": "SMS is not supported for this eSIM", "code": "SMS_NOT_SUPPORTED" }
```

Delivery failed:
```json
{ "success": false, "message": "Failed to send SMS", "code": "SMS_FAILED" }
```

#### 403 Forbidden

eSIM does not belong to your account:
```json
{ "success": false, "message": "You do not have permission to access this eSIM", "code": "FORBIDDEN" }
```

#### 404 Not Found

```json
{ "success": false, "message": "eSIM not found", "code": "ESIM_NOT_FOUND" }
```

## Example

```javascript
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

async function sendSms(iccid, message) {
  const accessCode = 'esf_your_access_code';
  const secretKey = 'sk_your_secret_key';

  const body = JSON.stringify({ iccid, message });
  const timestamp = Date.now().toString();
  const requestId = uuidv4();
  const signData = timestamp + requestId + accessCode + body;
  const signature = crypto.createHmac('sha256', secretKey)
    .update(signData)
    .digest('hex')
    .toUpperCase();

  const response = await fetch('https://esimfly.net/api/v1/business/esims/send-sms', {
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

  const data = await response.json();
  if (data.success) {
    console.log('SMS sent');
  } else {
    console.error(`SMS failed: ${data.message}`);
  }
  return data;
}
```

## Notes

- The message is delivered to the eSIM's device; it does not appear in any dashboard.
- Maximum length is **500** characters. Long messages may be split into multiple SMS by the network.
- Every send (success or failure) is recorded against the order for your audit trail.
