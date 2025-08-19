---
sidebar_position: 3
title: List All eSIMs
---

# List All eSIMs

Retrieve all purchased eSIMs for your business account.

## Endpoint

```
GET /api/v1/business/esims
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

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| search | String | - | Search by ICCID, package name, or package code |
| status | String | all | Filter by status: "all", "NEW", "ACTIVE", "EXPIRED", "CANCELLED", "DEPLETED", "DELETED" |
| page | Integer | 1 | Page number for pagination |
| limit | Integer | 20 | Number of results per page (max 100) |
| include_base64 | Boolean | false | Include base64 QR code data (for backward compatibility) |

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "esims": [
      {
        "id": 12345,
        "iccid": "8910300001234567890",
        "package_name": "Sweden 1GB - 7 Days", 
        "package_code": "sweden-7days-1gb",
        "countries": ["Sweden"],
        "status": "ACTIVE",
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
        },
        "qr_code": "https://storage.esimfly.net/qr-codes/12345-a1b2c3d4.png",
        "manual_installation": {
          "smdp_address": "rsp-eu.simlessly.com",
          "activation_code": "2D7F456148C640359B6A83E0E5AE34D3",
          "lpa_format": "LPA:1$rsp-eu.simlessly.com$2D7F456148C640359B6A83E0E5AE34D3"
        },
        "direct_apple_installation_url": "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=...",
        "flag_url": "/images/flags/se.png",
        "created_at": "2024-01-29T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

### eSIM Fields

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique eSIM identifier |
| iccid | String | ICCID (SIM card number) |
| package_name | String | Package display name |
| package_code | String | Package identifier (without provider prefix) |
| countries | Array | List of countries covered |
| status | String | Standardized status: NEW, ACTIVE, EXPIRED, CANCELLED, DEPLETED, DELETED |
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
| qr_code | String | QR code URL for installation |
| qr_code_base64 | String | Base64 QR code data (only if include_base64=true) |
| manual_installation | Object | Manual installation information |
| manual_installation.smdp_address | String | SM-DP+ server address |
| manual_installation.activation_code | String | Activation code for manual entry |
| manual_installation.lpa_format | String | Complete LPA format string |
| direct_apple_installation_url | String | Direct Apple installation URL |
| flag_url | String | Country flag URL |
| created_at | String | Purchase timestamp (ISO 8601) |

## Status Values

### Standardized Status Mapping

The API returns standardized status values that map various provider statuses:

| Status | Description | Provider Status Examples |
|--------|-------------|-------------------------|
| NEW | Not yet activated | new, got_resource, onboard, NOT_ACTIVE (with data) |
| ACTIVE | Currently active | active, in_use |
| EXPIRED | Validity period ended | expired, NOT_ACTIVE (without data) |
| CANCELLED | Cancelled by user/system | canceled, cancelled, cancel |
| DEPLETED | Data fully consumed | depleted |
| DELETED | Permanently deleted | deleted |

## Examples

### Get All eSIMs

```javascript
const response = await fetch(
  'https://esimfly.net/api/v1/business/esims',
  {
    headers: generateHMACHeaders() // Your HMAC function
  }
);
```

### Filter by Status

Get only active eSIMs:
```javascript
const queryParams = new URLSearchParams({
  status: 'ACTIVE',
  limit: 50
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);
```

Get new (unactivated) eSIMs:
```javascript
const queryParams = new URLSearchParams({
  status: 'NEW',
  limit: 50
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);
```

### Search by ICCID

```javascript
const queryParams = new URLSearchParams({
  search: '8910300001234567890',
  limit: 10
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);
```

### Search by Package Name

```javascript
const queryParams = new URLSearchParams({
  search: 'Sweden',
  limit: 20
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);
```

### Include Base64 QR Code

```javascript
const queryParams = new URLSearchParams({
  status: 'NEW',
  include_base64: 'true'
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);

// Response will include qr_code_base64 field
```

## Full Example (Node.js)

```javascript
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

async function getMyESIMs(status = 'all', page = 1) {
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
    status: status,
    page: page.toString(),
    limit: '50'
  });

  const response = await fetch(
    `https://esimfly.net/api/v1/business/esims?${queryParams}`,
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
    console.log(`Found ${data.data.esims.length} eSIMs`);
    console.log(`Total: ${data.data.pagination.total}`);
    
    // Process each eSIM
    data.data.esims.forEach(esim => {
      console.log(`ICCID: ${esim.iccid}`);
      console.log(`Status: ${esim.status}`);
      console.log(`Data: ${esim.data.used_mb}MB / ${esim.data.total_mb}MB`);
      console.log(`Countries: ${esim.countries.join(', ')}`);
      console.log('---');
    });
  }
  
  return data;
}

// Example usage
getMyESIMs('ACTIVE', 1);
```

## Data Usage Calculation

The API automatically calculates data usage from various provider formats:

- **total_mb**: Total data allowance in MB (0 for unlimited plans)
- **used_mb**: Data consumed in MB
- **remaining_mb**: Data remaining in MB
- **usage_percentage**: Percentage of data used (0-100)

For unlimited plans:
- `total_mb` = 0
- `remaining_mb` = 0  
- `is_unlimited` = true
- `usage_percentage` shows actual usage

## Installation Methods

The API provides multiple ways to install eSIMs:

### 1. QR Code Installation
- **qr_code**: URL to QR code image
- Most common method - user scans with device camera
- Works on all eSIM-compatible devices

### 2. Direct Apple Installation
- **direct_apple_installation_url**: One-click installation for iOS
- Opens directly in iOS settings when clicked
- Simplest method for iPhone users

### 3. Manual Installation
- **manual_installation**: Contains all details for manual entry
  - **smdp_address**: Server address (e.g., "rsp-eu.simlessly.com")
  - **activation_code**: Code to enter (e.g., "2D7F456148C640359B6A83E0E5AE34D3")
  - **lpa_format**: Complete string for copy/paste
- Used when QR scanning isn't available
- Required for some Android devices

Example manual installation data:
```json
{
  "manual_installation": {
    "smdp_address": "rsp-eu.simlessly.com",
    "activation_code": "2D7F456148C640359B6A83E0E5AE34D3",
    "lpa_format": "LPA:1$rsp-eu.simlessly.com$2D7F456148C640359B6A83E0E5AE34D3"
  }
}
```

## QR Code Handling

### Default Behavior
- QR codes are returned as URLs pointing to optimized images
- URLs are consistent - same QR code always returns same URL
- Images are cached for fast delivery

### Legacy Support
- Set `include_base64=true` to also receive base64 data
- Not recommended for production use (increases response size)

Example QR code URL format:
```
https://storage.esimfly.net/qr-codes/12345-a1b2c3d4.png
```

## Error Responses

### 400 Bad Request

Invalid request ID format:
```json
{
  "success": false,
  "error": "Invalid or missing RT-RequestID header. Must be a valid UUID v4.",
  "code": "INVALID_REQUEST_ID"
}
```

### 401 Unauthorized

Missing authentication:
```json
{
  "success": false,
  "error": "Authentication required",
  "message": "Please provide either Bearer token or complete HMAC signature authentication"
}
```

Invalid API key:
```json
{
  "success": false,
  "error": "Invalid API key",
  "code": "INVALID_API_KEY"
}
```

### 403 Forbidden

Not a business account:
```json
{
  "success": false,
  "error": "Invalid user or not a business account",
  "code": "INVALID_USER"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to fetch eSIMs"
}
```

## Pagination

For accounts with many eSIMs, use pagination parameters:

```javascript
// Get page 2 with 50 items per page
const queryParams = new URLSearchParams({
  page: '2',
  limit: '50'
});
```

Pagination info in response:
```json
{
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 245,
    "total_pages": 5
  }
}
```

## Best Practices

1. **Use status filters** to reduce response size when you only need specific eSIMs
2. **Implement pagination** for accounts with many eSIMs
3. **Cache results** appropriately - eSIM data changes when activated or used
4. **Use search** for finding specific eSIMs by ICCID
5. **Monitor data usage** regularly for active eSIMs
6. **Handle all status types** - providers may have different status values

## Notes

- Status values are standardized across all providers
- Package codes have provider prefixes removed (e.g., "airalo_" prefix)
- Countries array shows all covered destinations
- Data usage is calculated from provider-specific formats
- QR codes are optimized and cached for performance
- The `qr_code_base64` field is only included when `include_base64=true`
- All timestamps are in ISO 8601 format (UTC)