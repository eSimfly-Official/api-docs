---
sidebar_position: 4
title: Process Topup Order
---

import LlmPrompt from '@site/src/components/LlmPrompt';

# Process Topup Order

Process a top-up order for a specific eSIM with automatic profit calculation.

## Endpoint

```
POST /api/v1/business/topup/order
```

<LlmPrompt id="topup-order" />

## Authentication

This endpoint requires HMAC authentication. See [Authentication](/docs/api-authentication) for details.

## Request Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| RT-AccessCode | String | Yes | Your API access code |
| RT-RequestID | String | Yes | Unique request ID (UUID v4) |
| RT-Timestamp | String | Yes | Request timestamp in milliseconds |
| RT-Signature | String | Yes | HMAC-SHA256 signature |
| Content-Type | String | Yes | application/json |

## Request Body

Simply provide the ICCID and package code - everything else is handled automatically.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| iccid | String | **Yes** | eSIM ICCID to top up |
| packageCode | String | **Yes** | Package code from topup packages endpoint |
| idempotency_key | String | Recommended | Your own unique id for this top-up (max 200 chars). A retry with the same key returns the original top-up (`duplicate: true`) instead of applying and charging it again |
| quantity | Integer | No | Accepted for compatibility only — a top-up always applies (and charges for) exactly **one** package |

The API automatically handles:
- Package name lookup
- Price calculation with your custom markup, in your account currency
- Topup compatibility validation
- Duplicate protection (see [Idempotency](#idempotency))

## eSIM Eligibility

An eSIM can be topped up when its status is one of the following (status comparison is case-insensitive, so `ACTIVE`, `Active`, and `active` are all accepted):

| Status | Toppable |
|--------|----------|
| `ACTIVE` / `IN_USE` | All providers |
| `DEPLETED` (data used up, plan still open) | All providers |
| `EXPIRED` / `USED_EXPIRED` (used, then expired) | All providers |
| `NEW` (not yet activated) | eSIMfly-provided eSIMs only |

Every other status (cancelled, deleted, suspended, unused-expired, pending, ...) returns `ESIM_NOT_TOPPABLE` (400): the eSIM is gone or was never usable, so a top-up would be charged for nothing.

### Example Request

```json
{
  "iccid": "8943108170002570328",
  "packageCode": "2191323",
  "idempotency_key": "topup-48213"
}
```

## Idempotency

Send an `idempotency_key` (your own top-up id) with every top-up:

- **Retry with the same key** after a timeout or network error → you get the **original** top-up back with `"duplicate": true`. Nothing is applied or charged a second time.
- **Without a key**, the API still blocks a *concurrent* identical top-up (same eSIM + same package while the first is still running) with `409 DUPLICATE_REQUEST` before anything is charged. Sequential top-ups are never blocked.
- Top-up keys live in their own namespace — a key you already used for an [order](/docs/api/create-order) never replays here.

The replay response carries `orderReference`, `iccid`, `packageName`, `status`, `amount` and `currency` (no `newBalance`, `profit` or `esimData` — call [Get Balance](/docs/api/balance) if you need the balance then).

## Response

### Success Response (200 OK)

**USD User Example:**
```json
{
  "success": true,
  "message": "eSIM top-up processed successfully",
  "orderReference": "topup_1755559183090_vyf9w",
  "iccid": "8943108170002570328",
  "packageName": "Turkey 1GB 7Days",
  "newBalance": 550.68,
  "currency": "USD",
  "status": "completed",
  "amount": 2.45,
  "profit": 0.23,
  "processing_time_ms": 3724,
  "esimData": {
    "newTotalVolumeGB": 8.0,
    "newRemainingVolumeGB": 8.0,
    "expiredTime": "February 13, 2026 at 11:27 PM"
  }
}
```

**IQD User Example:**
```json
{
  "success": true,
  "message": "eSIM top-up processed successfully",
  "orderReference": "topup_1755559183090_vyf9w",
  "iccid": "8943108170002570328",
  "packageName": "Iraq 1GB 7Days",
  "newBalance": 726895,
  "currency": "IQD",
  "status": "completed",
  "amount": 4856,
  "profit": 456,
  "processing_time_ms": 3724,
  "esimData": {
    "newTotalVolumeGB": 8.0,
    "newRemainingVolumeGB": 8.0,
    "expiredTime": "February 13, 2026 at 11:27 PM"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | Operation success status |
| message | String | Success message |
| orderReference | String | Unique order reference for tracking |
| iccid | String | eSIM ICCID that was topped up |
| packageName | String | Name of the topup package applied |
| newBalance | Number | Your updated account balance in your account currency (not on a `duplicate` replay) |
| currency | String | Your account (wallet) currency: `USD`, `IQD`, `EUR`, `CHF` or `NOK`. Prices are quoted and charged in it — EUR / CHF / NOK at the daily charge rate |
| status | String | Order status (always "completed" for successful orders) |
| amount | Number | Total amount charged, in `currency` |
| profit | Number | Your profit from this transaction, in `currency` |
| processing_time_ms | Integer | Processing time in milliseconds |
| esimData | Object | Updated eSIM information |
| duplicate | Boolean | `true` only when this is the replay of an earlier top-up with the same `idempotency_key` |

### eSIM Data Object

| Field | Type | Description |
|-------|------|-------------|
| newTotalVolumeGB | Number | New total data capacity in GB after topup |
| newRemainingVolumeGB | Number | New remaining data in GB (total - used) |
| expiredTime | String | Human-readable expiry date and time |

## Error Responses

### 400 Bad Request

Missing required fields:
```json
{
  "success": false,
  "message": "Missing required fields: iccid, packageCode",
  "code": "MISSING_FIELDS"
}
```

eSIM not found:
```json
{
  "success": false,
  "error": "eSIM not found or access denied",
  "code": "ESIM_NOT_FOUND"
}
```

eSIM cannot be topped up:
```json
{
  "success": false,
  "message": "eSIM cannot be topped up. Current status: EXPIRED",
  "code": "ESIM_NOT_TOPPABLE"
}
```

Only `ACTIVE`, `IN_USE`, `DEPLETED`, `EXPIRED` or `USED_EXPIRED` eSIMs can be topped up (case-insensitive). eSIMs in `NEW` status can also be topped up when the eSIM is provided by eSIMfly.

Insufficient balance:
```json
{
  "success": false,
  "error": "Insufficient balance",
  "message": "Your current balance is $2.50. Required: $3.68",
  "code": "INSUFFICIENT_BALANCE"
}
```

Invalid topup package:
```json
{
  "success": false,
  "message": "Invalid top-up package code. Package not found.",
  "code": "INVALID_TOPUP_PACKAGE"
}
```

Topup not supported:
```json
{
  "success": false,
  "error": "Top-ups not available for this eSIM",
  "code": "TOPUP_NOT_SUPPORTED"
}
```

Price mismatch (only when you send the optional legacy `price` field and it differs from the current price):
```json
{
  "success": false,
  "message": "Invalid price submitted",
  "code": "PRICE_MISMATCH"
}
```

### 401 Unauthorized

See [Authentication documentation](/docs/api-authentication#error-responses) for authentication errors.

### 409 Conflict

The same top-up is already being processed — the same `idempotency_key`, or (without a key) the same package onto the same eSIM. Nothing was charged; wait for the first request to finish (or retry later with the same key to get its result):
```json
{
  "success": false,
  "message": "An identical top-up for this eSIM is already being processed. Wait for it to finish before sending another.",
  "code": "DUPLICATE_REQUEST"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to process topup order"
}
```

## Get Top-up Status

```
GET /api/v1/business/topup/order?orderReference={orderReference}
```

Look up one top-up by the `orderReference` the top-up call returned (same HMAC authentication).

```json
{
  "success": true,
  "order": {
    "id": 51130,
    "orderReference": "topup_1755559183090_vyf9w",
    "packageName": "Top-up: Turkey 1GB 7Days",
    "packageCode": "2191323",
    "status": "completed",
    "amount": 2.45,
    "finalPrice": 2.45,
    "orderDate": "2026-11-19T10:12:03.000Z",
    "paymentMethod": "balance",
    "paymentStatus": "succeeded"
  }
}
```

A top-up still being processed returns only `orderReference`, `status`, `details` and `created_at` in `order`. `details` contains only `status`, and when present `message`, `esim_id` and `topup_order_id`. Errors: `MISSING_ORDER_REFERENCE` (400), `ORDER_NOT_FOUND` (404).

## Examples

### Basic Topup Order

```javascript
// iccid + packageCode, plus your own top-up id so a retry can never apply it twice
const orderData = {
  iccid: '8943108170002570328',
  packageCode: '2191323',
  idempotency_key: `topup-${myTopupId}`
};

const response = await fetch(
  'https://esimfly.net/api/v1/business/topup/order',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...generateHMACHeaders() // Your HMAC function
    },
    body: JSON.stringify(orderData)
  }
);

const result = await response.json();
if (result.success) {
  console.log(`Topup successful! Order: ${result.orderReference}`);
  console.log(`New balance: $${result.newBalance}`);
  console.log(`Profit earned: $${result.profit}`);
  console.log(`eSIM now has ${result.esimData.newTotalVolumeGB}GB total`);
}
```

### Error Handling

```javascript
try {
  const response = await fetch(/* ... */);
  const result = await response.json();
  
  if (!result.success) {
    switch (result.code) {
      case 'INSUFFICIENT_BALANCE':
        console.log('Need to add funds to account');
        break;
      case 'ESIM_NOT_TOPPABLE':
        console.log('eSIM cannot be topped up in current state');
        break;
      case 'INVALID_TOPUP_PACKAGE':
        console.log('Package not valid for this eSIM');
        break;
      case 'DUPLICATE_REQUEST':
        console.log('Same top-up already running - retry later with the same idempotency_key');
        break;
      default:
        console.log('Topup failed:', result.error);
    }
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

## Important Notes

### Automatic Processing
- Balance deduction happens automatically upon successful topup
- Profit calculation is handled server-side using your account settings
- eSIM data is updated in real-time

### Provider Compatibility
- Cross-provider topups are supported (e.g., topping up any eSIM with any compatible package)
- Provider detection is automatic based on package code format
- All provider-specific logic is handled transparently

### Security & Validation
- Package prices are validated server-side to prevent manipulation
- Only eSIMs you own can be topped up
- Balance checks are performed before processing
- All transactions are logged and auditable

### Best Practices

1. **Get packages first**: Always call [Get Topup Packages](/docs/api/topup-packages) to get available options
2. **Use exact codes**: Use the exact `package_code` returned from the packages endpoint
3. **Always send an `idempotency_key`**: then a retry after a timeout is safe — it returns the original top-up instead of charging again
4. **Handle errors gracefully**: Always check for insufficient balance and eSIM status errors
5. **Store order reference**: Keep `orderReference` for customer support, tracking and [status lookups](#get-top-up-status)
6. **Monitor profit**: Track your earnings using the `profit` field in responses

With the [Node.js SDK](https://www.npmjs.com/package/@esimfly/sdk) (0.2.0+):

```javascript
const topup = await esimfly.topups.create({ iccid, packageCode, idempotencyKey: `topup-${myTopupId}` });
const status = await esimfly.topups.get(topup.orderReference);
```

## Relationship to Other Endpoints

- **Prerequisites**: [Get eSIMs](/docs/api/esims) to get ICCID, then [Get Topup Packages](/docs/api/topup-packages)
- **Follow-up**: Use [Get Orders](/docs/api/orders) to track order history
- **Account**: Check [Get Balance](/docs/api/balance) for current balance after topup

## Legacy Integration Note

If you have an existing integration that sends additional fields like `packageName` or `price`, it will continue to work without any changes. The API is fully backward compatible.

For new integrations, we recommend sending only `iccid`, `packageCode` and `idempotency_key` as shown in the examples above.