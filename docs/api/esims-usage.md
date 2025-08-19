---
sidebar_position: 4
title: Query eSIM Usage
---

# Query eSIM Usage

Get detailed usage information for a specific eSIM by ICCID or Order ID.

## Endpoint

```
GET /api/v1/business/esims/usage/query
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

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| iccid | String | No* | ICCID of the eSIM to query |
| order_id | String | No* | Order ID associated with the eSIM |
| from_date | String | No | Start date for usage history (YYYY-MM-DD) |
| to_date | String | No | End date for usage history (YYYY-MM-DD) |

*Either `iccid` or `order_id` is required, but not both.

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "esim": {
      "iccid": "8910300001234567890",
      "order_id": "ESF_1234567890",
      "package_name": "Sweden 1GB - 7 Days",
      "status": "ACTIVE"
    },
    "data": {
      "total_mb": 1024,
      "used_mb": 256,
      "remaining_mb": 768,
      "usage_percentage": 25,
      "is_unlimited": false
    },
    "validity": {
      "days": 7,
      "activated_at": "2024-01-29T10:30:00Z",
      "expires_at": "2024-02-05T10:30:00Z",
      "is_expired": false
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| esim | Object | Basic eSIM information |
| esim.iccid | String | ICCID (SIM card number) |
| esim.order_id | String | Order reference ID |
| esim.package_name | String | Package display name |
| esim.status | String | Standardized status (NEW, ACTIVE, EXPIRED, etc.) |
| data | Object | Data usage information |
| data.total_mb | Integer | Total data in MB (0 for unlimited) |
| data.used_mb | Integer | Data used in MB |
| data.remaining_mb | Integer | Data remaining in MB (0 for unlimited) |
| data.usage_percentage | Number | Usage percentage (0-100) |
| data.is_unlimited | Boolean | Whether plan has unlimited data |
| validity | Object | Validity period information |
| validity.days | Integer | Total validity days |
| validity.activated_at | String | Activation timestamp (ISO 8601) |
| validity.expires_at | String | Expiration timestamp (ISO 8601) |
| validity.is_expired | Boolean | Whether eSIM has expired |

## Examples

### Query by ICCID

```javascript
const queryParams = new URLSearchParams({
  iccid: '8910300001234567890'
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims/usage/query?${queryParams}`,
  {
    headers: generateHMACHeaders() // Your HMAC function
  }
);
```

### Query by Order ID

```javascript
const queryParams = new URLSearchParams({
  order_id: 'ESF_1234567890'
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims/usage/query?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);
```

### Query with Date Range (Future Feature)

```javascript
const queryParams = new URLSearchParams({
  iccid: '8910300001234567890',
  from_date: '2024-01-01',
  to_date: '2024-01-31'
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims/usage/query?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);

// When implemented, response will include:
// "usage_history": [
//   {
//     "date": "2024-01-15",
//     "data_used_mb": 100,
//     "cumulative_mb": 256
//   }
// ]
```

## Full Example (Node.js)

```javascript
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

async function queryESIMUsage(identifier, identifierType = 'iccid') {
  const accessCode = 'esf_your_access_code';
  const secretKey = 'sk_your_secret_key';
  
  // Generate HMAC headers
  const timestamp = Date.now().toString();
  const requestId = uuidv4();
  const signData = timestamp + requestId + accessCode;
  const signature = crypto.createHmac('sha256', secretKey)
    .update(signData)
    .digest('hex')
    .toUpperCase();

  // Build query parameters
  const queryParams = new URLSearchParams({
    [identifierType]: identifier
  });

  const response = await fetch(
    `https://esimfly.net/api/v1/business/esims/usage/query?${queryParams}`,
    {
      headers: {
        'RT-AccessCode': accessCode,
        'RT-RequestID': requestId,
        'RT-Timestamp': timestamp,
        'RT-Signature': signature
      }
    }
  );

  const data = await response.json();
  
  if (data.success) {
    const { esim, data: usage, validity } = data.data;
    
    console.log(`eSIM: ${esim.package_name}`);
    console.log(`Status: ${esim.status}`);
    console.log(`Usage: ${usage.used_mb}MB / ${usage.total_mb}MB (${usage.usage_percentage}%)`);
    console.log(`Remaining: ${usage.remaining_mb}MB`);
    
    if (validity.is_expired) {
      console.log('Status: EXPIRED');
    } else {
      const daysLeft = Math.ceil(
        (new Date(validity.expires_at) - new Date()) / (1000 * 60 * 60 * 24)
      );
      console.log(`Days remaining: ${daysLeft} of ${validity.days}`);
    }
  }
  
  return data;
}

// Example usage
queryESIMUsage('8910300001234567890', 'iccid');
queryESIMUsage('ESF_1234567890', 'order_id');
```

## Error Responses

### 400 Bad Request

Missing required parameters:
```json
{
  "error": "Bad Request",
  "message": "Either iccid or order_id is required"
}
```

### 404 Not Found

eSIM not found:
```json
{
  "error": "Not Found",
  "message": "eSIM not found or you do not have access to it"
}
```

### 401 Unauthorized

Authentication errors follow the same pattern as other endpoints:
```json
{
  "success": false,
  "error": "Authentication required",
  "message": "Please provide either Bearer token or complete HMAC signature authentication"
}
```

## Use Cases

### 1. Real-time Usage Monitoring

Monitor data consumption for active eSIMs:
```javascript
async function checkDataUsage(iccid) {
  const usage = await queryESIMUsage(iccid, 'iccid');
  
  if (usage.data.usage_percentage > 80) {
    console.warn(`High usage alert: ${usage.data.usage_percentage}% consumed`);
    // Send notification or trigger top-up
  }
}
```

### 2. Expiry Tracking

Check if eSIMs are about to expire:
```javascript
async function checkExpiry(orderIds) {
  for (const orderId of orderIds) {
    const result = await queryESIMUsage(orderId, 'order_id');
    
    if (result.success) {
      const { validity } = result.data;
      
      if (!validity.is_expired) {
        const daysLeft = Math.ceil(
          (new Date(validity.expires_at) - new Date()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysLeft <= 3) {
          console.log(`eSIM ${orderId} expires in ${daysLeft} days`);
        }
      }
    }
  }
}
```

### 3. Customer Support

Quickly check eSIM status for support queries:
```javascript
async function supportLookup(identifier) {
  // Try ICCID first
  let result = await queryESIMUsage(identifier, 'iccid');
  
  // If not found, try as order ID
  if (!result.success) {
    result = await queryESIMUsage(identifier, 'order_id');
  }
  
  if (result.success) {
    const { esim, data, validity } = result.data;
    
    console.log('=== eSIM Support Information ===');
    console.log(`Package: ${esim.package_name}`);
    console.log(`Status: ${esim.status}`);
    console.log(`Data: ${data.used_mb}/${data.total_mb}MB`);
    console.log(`Expires: ${validity.expires_at || 'N/A'}`);
  }
}
```

## Best Practices

1. **Cache Results Appropriately**
   - Usage data changes as customers use data
   - Consider caching for 5-15 minutes for non-critical displays
   - Always fetch fresh data for critical operations

2. **Error Handling**
   - Always check if the eSIM exists before processing
   - Handle both 404 (not found) and 401 (unauthorized) errors
   - Implement retry logic for network failures

3. **Identifier Choice**
   - Use ICCID when available (more specific)
   - Order ID is useful for customer-facing lookups
   - Store both identifiers in your system for flexibility

4. **Performance**
   - This endpoint queries a single eSIM - very fast
   - For bulk operations, consider using the list endpoint with filters
   - Implement parallel requests carefully to avoid rate limits

## Notes

- Data usage is calculated in real-time from provider data
- All data values are in megabytes (MB) for consistency
- Unlimited plans show `total_mb: 0` and `is_unlimited: true`
- The `from_date` and `to_date` parameters are reserved for future usage history features
- Usage percentages are capped at 100% even if over-usage occurs