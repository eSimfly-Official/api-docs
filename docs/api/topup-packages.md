---
sidebar_position: 3
title: Get Topup Packages
---

# Get Topup Packages

Retrieve available top-up packages for a specific eSIM with your pricing.

## Endpoint

```
GET /api/v1/business/topup/packages
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
| iccid | String | **Yes** | eSIM ICCID to get compatible topup packages |
| page | Integer | No | Page number for pagination (default: 1) |
| limit | Integer | No | Number of results per page (default: 50, max: 100) |

## Response

### Success Response (200 OK)

**USD User Example:**
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "package_code": "TOPUP_PXOO225PI",
        "name": "Iraq 3GB 30Days",
        "data_amount_gb": 3,
        "validity_days": 30,
        "cost": 10.56,
        "currency": "USD",
        "features": {
          "is_rechargeable": true
        },
        "is_unlimited": false
      },
      {
        "package_code": "turkey-7days-1gb-topup",
        "name": "Turkey 1GB 7Days",
        "data_amount_gb": 1,
        "validity_days": 7,
        "cost": 2.45,
        "currency": "USD",
        "features": {
          "is_rechargeable": true
        },
        "is_unlimited": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 8,
      "total_pages": 1
    }
  }
}
```

**IQD User Example:**
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "package_code": "TOPUP_PXOO225PI",
        "name": "Iraq 3GB 30Days",
        "data_amount_gb": 3,
        "validity_days": 30,
        "cost": 13939,
        "currency": "IQD",
        "features": {
          "is_rechargeable": true
        },
        "is_unlimited": false
      },
      {
        "package_code": "turkey-7days-1gb-topup",
        "name": "Turkey 1GB 7Days",
        "data_amount_gb": 1,
        "validity_days": 7,
        "cost": 3234,
        "currency": "IQD",
        "features": {
          "is_rechargeable": true
        },
        "is_unlimited": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 8,
      "total_pages": 1
    }
  }
}
```

### Package Fields

| Field | Type | Description |
|-------|------|-------------|
| package_code | String | Topup package identifier (use this for topup operations) |
| name | String | Package display name |
| data_amount_gb | Number | Data allowance in GB |
| validity_days | Integer | Validity period in days |
| cost | Number | Your cost price in user's preferred currency |
| currency | String | Currency code (USD or IQD based on user preference) |
| features | Object | Package features object |
| features.is_rechargeable | Boolean | Always true for topup packages |
| is_unlimited | Boolean | Unlimited data flag |

## Examples

### Get Topup Packages for Specific eSIM

```javascript
const queryParams = new URLSearchParams({
  iccid: '8943108170003135816',
  limit: 20
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/topup/packages?${queryParams}`,
  {
    headers: generateHMACHeaders() // Your HMAC function
  }
);

const data = await response.json();
console.log(`Found ${data.data.packages.length} topup packages`);
```

### With Pagination

```javascript
const queryParams = new URLSearchParams({
  iccid: '8943108170003135816',
  page: 1,
  limit: 10
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/topup/packages?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);
```

## Error Responses

### 400 Bad Request

Missing ICCID parameter:
```json
{
  "success": false,
  "error": "ICCID parameter is required",
  "message": "Topup packages are specific to an eSIM. Please provide the ICCID parameter.",
  "code": "MISSING_ICCID"
}
```

### 400 Bad Request

eSIM cannot be topped up due to status:
```json
{
  "success": false,
  "error": "eSIM cannot be topped up. Current status: EXPIRED",
  "message": "Only ACTIVE, DEPLETED, or USED_EXPIRED eSIMs can be topped up",
  "code": "ESIM_NOT_TOPPABLE"
}
```

### 403 Forbidden

eSIM not found or access denied:
```json
{
  "success": false,
  "error": "eSIM not found or access denied",
  "code": "ESIM_ACCESS_DENIED"
}
```

### 401 Unauthorized

See [Packages endpoint](/docs/api/packages#error-responses) for common authentication errors.

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to fetch top-up packages"
}
```

## Important Notes

### Multi-Currency Pricing
- **Pricing Display**: Topup prices are shown in your preferred currency (USD or IQD)
- **Currency Conversion**: IQD prices are converted using real-time exchange rates
- **Currency Preference**: Set your preferred currency in the business dashboard settings
- **Format**: USD prices show 2 decimals, IQD prices are whole numbers

### Provider-Agnostic Response
- Package codes are cleaned and standardized
- Different package code formats are used depending on the provider
- All provider-specific handling is done automatically

### Package Availability
- Topup packages are **eSIM-specific** - each eSIM has different available options
- Packages are automatically filtered by the eSIM's location
- Only compatible topup packages for that specific eSIM are returned

### Security
- Users can only access topup packages for eSIMs they own
- ICCID ownership is verified for each request
- All requests are logged and monitored

## Integration Tips

1. **Always specify ICCID**: This endpoint requires the specific eSIM identifier
2. **Use returned package_code**: Use the exact `package_code` from response for topup operations
3. **Automatic handling**: The API handles all backend complexity automatically
4. **Pagination**: Use pagination for eSIMs with many topup options
5. **Error handling**: Always handle the case where no topup packages are available

## Relationship to Other Endpoints

- Use with [Get eSIMs](/docs/api/esims) to get ICCIDs
- Use `package_code` from this endpoint with topup operations
- Pricing matches your account's profit margin settings