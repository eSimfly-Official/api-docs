---
sidebar_position: 4
title: Process Topup Order
---

# Process Topup Order

Process a top-up order for a specific eSIM with automatic profit calculation.

## Endpoint

```
POST /api/v1/business/topup/order
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
| Content-Type | String | Yes | application/json |

## Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| iccid | String | **Yes** | eSIM ICCID to top up |
| packageCode | String | **Yes** | Package code from topup packages endpoint |
| packageName | String | **Yes** | Package display name |
| price | Number | **Yes** | Package price (for validation) |
| quantity | Integer | No | Number of packages (default: 1) |

### Example Request

**USD User:**
```json
{
  "iccid": "8943108170002570328",
  "packageCode": "turkey-7days-1gb-topup",
  "packageName": "Turkey 1GB 7Days",
  "price": 2.45,
  "quantity": 1
}
```

**IQD User:**
```json
{
  "iccid": "8943108170002570328",
  "packageCode": "TOPUP_PLGJ7UB3C",
  "packageName": "Iraq 1GB 7Days",
  "price": 4856,
  "quantity": 1
}
```

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
| newBalance | Number | Your updated account balance in preferred currency |
| currency | String | Currency code (USD or IQD based on user preference) |
| status | String | Order status (always "completed" for successful orders) |
| amount | Number | Total amount charged in user's preferred currency |
| profit | Number | Your profit from this transaction in user's preferred currency |
| processing_time_ms | Integer | Processing time in milliseconds |
| esimData | Object | Updated eSIM information |

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
  "error": "Missing required fields",
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
  "error": "eSIM cannot be topped up. Current status: EXPIRED",
  "message": "Only ACTIVE, DEPLETED, or USED_EXPIRED eSIMs can be topped up",
  "code": "ESIM_NOT_TOPPABLE"
}
```

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
  "error": "Invalid topup package",
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

### 401 Unauthorized

See [Authentication documentation](/docs/api-authentication#error-responses) for authentication errors.

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to process topup order"
}
```

## Examples

### Basic Topup Order

```javascript
const orderData = {
  iccid: '8943108170002570328',
  packageCode: 'TOPUP_PLGJ7UB3C',
  packageName: 'Iraq 1GB 7Days',
  price: 3.68,
  quantity: 1
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
3. **Handle errors gracefully**: Always check for insufficient balance and eSIM status errors
4. **Store order reference**: Keep `orderReference` for customer support and tracking
5. **Monitor profit**: Track your earnings using the `profit` field in responses

## Relationship to Other Endpoints

- **Prerequisites**: [Get eSIMs](/docs/api/esims) to get ICCID, then [Get Topup Packages](/docs/api/topup-packages)
- **Follow-up**: Use [Get Orders](/docs/api/orders) to track order history
- **Account**: Check [Get Balance](/docs/api/balance) for current balance after topup