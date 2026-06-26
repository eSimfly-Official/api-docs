---
sidebar_position: 5
title: Cancel eSIM
---

# Cancel eSIM

Cancel an eSIM that has **not yet been activated** and refund the amount to your balance.

When an order contains multiple eSIMs (same `orderReference`), all eligible eSIMs in that order are cancelled together.

## Endpoint

```
POST /api/v1/business/esims/cancel
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

Identify the eSIM by `iccid` (recommended) or `esimId`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| iccid | String | Yes* | The ICCID of the eSIM to cancel |
| esimId | Integer | Yes* | The eSIM `id` (from the eSIM list/order response). Used if `iccid` is not provided. |

\* Provide **either** `iccid` or `esimId`.

```json
{
  "iccid": "8948010010036785060"
}
```

## Cancellation Eligibility

An eSIM can only be cancelled (and refunded) **before it has been activated or connected to a network**.

| Eligible when | Not eligible when |
|---------------|-------------------|
| Newly provisioned — not yet downloaded, installed, used, or connected to a network | The eSIM has been activated, installed, used, or has connected to any network |

In all cases, an eSIM that has an activation date (QR code scanned and installed) cannot be cancelled. Depending on the package, a cancellation is either processed immediately or submitted as a refund request that is confirmed shortly afterwards.

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "All 1 eSIM cancelled successfully.",
  "data": {
    "order_reference": "order_1692123456_ab7cd",
    "total_esims": 1,
    "cancelled_esims": 1,
    "failed_esims": 0,
    "refunded_amount": 2.72,
    "currency": "USD",
    "refund_method": "balance",
    "balance_credited": true,
    "partial_cancellation": false,
    "cancel_results": [
      {
        "esimId": 15757,
        "iccid": "8948010010036785060",
        "success": true,
        "refundAmount": 2.72
      }
    ]
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | Whether at least one eSIM was cancelled |
| message | String | Human-readable summary |
| data.order_reference | String | The order the eSIM belongs to |
| data.total_esims | Integer | Number of eSIMs in the order |
| data.cancelled_esims | Integer | Number successfully cancelled |
| data.failed_esims | Integer | Number that failed to cancel |
| data.refunded_amount | Number | Amount refunded to your balance (may be `0` for some packages whose refund is handled separately) |
| data.currency | String | Currency of the refund |
| data.refund_method | String | How the refund was processed: `balance`, `refund_request`, or `separate` |
| data.balance_credited | Boolean | Whether your account balance was credited |
| data.partial_cancellation | Boolean | True if only some eSIMs in the order were cancelled |
| data.cancel_results | Array | Per-eSIM cancellation result |

## Error Responses

### 400 Bad Request

Missing identifier:
```json
{ "success": false, "message": "Provide either iccid or esimId", "code": "MISSING_IDENTIFIER" }
```

Already cancelled:
```json
{ "success": false, "message": "This eSIM has already been cancelled and cannot be cancelled again", "code": "ALREADY_CANCELLED" }
```

Not eligible (e.g. already activated):
```json
{
  "success": false,
  "message": "No eSIMs are eligible for cancellation",
  "code": "NOT_ELIGIBLE",
  "details": {
    "totalEsims": 1,
    "ineligibleEsims": [
      {
        "id": 15757,
        "iccid": "8948010010036785060",
        "reason": "This eSIM has already been activated and cannot be cancelled or refunded"
      }
    ]
  }
}
```

### 403 Forbidden

eSIM does not belong to your account:
```json
{ "success": false, "message": "You do not have permission to cancel this eSIM", "code": "FORBIDDEN" }
```

### 404 Not Found

```json
{ "success": false, "message": "eSIM not found", "code": "ESIM_NOT_FOUND" }
```

## Example

```javascript
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

async function cancelEsim(iccid) {
  const accessCode = 'esf_your_access_code';
  const secretKey = 'sk_your_secret_key';

  const body = JSON.stringify({ iccid });
  const timestamp = Date.now().toString();
  const requestId = uuidv4();
  const signData = timestamp + requestId + accessCode + body;
  const signature = crypto.createHmac('sha256', secretKey)
    .update(signData)
    .digest('hex')
    .toUpperCase();

  const response = await fetch('https://esimfly.net/api/v1/business/esims/cancel', {
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
    console.log(`Cancelled ${data.data.cancelled_esims} eSIM(s), refunded ${data.data.refunded_amount} ${data.data.currency}`);
  } else {
    console.error(`Cancel failed: ${data.message}`);
  }
  return data;
}
```

## Notes

- Refunds are credited to your **account balance** (not the original payment method).
- For some packages the refund is handled separately, so `refunded_amount` is `0` and `balance_credited` is `false`.
- Cancellation is **idempotent-safe**: a second attempt on an already-cancelled eSIM returns `ALREADY_CANCELLED` and does not double-refund.
