---
sidebar_position: 2
title: Get All Packages
---

# Get All Packages

Retrieve available eSIM packages with your pricing.

## Endpoint

```
GET /api/v1/business/esims/packages
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
| search | String | - | Search packages by country name or destination |
| type | String | - | Filter by package type: "local", "regional", or "global" |
| page | Integer | 1 | Page number for pagination |
| limit | Integer | 50 | Number of results per page (max 100) |

## Response

### Success Response (200 OK)

**USD User Example:**
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "package_code": "PHAJHEAYP",
        "name": "United States 1GB 7Days",
        "region": "United States",
        "type": "local",
        "data_amount_gb": 1,
        "validity_days": 7,
        "cost": 1.44,
        "currency": "USD",
        "features": {
          "voice_minutes": 0,
          "sms_count": 0,
          "is_rechargeable": true
        },
        "is_unlimited": false,
        "has_voice": false,
        "has_sms": false,
        "locationNetworkList": [
          {
            "locationName": "United States",
            "locationLogo": "/images/flags/us.png",
            "operatorList": [
              {
                "operatorName": "Verizon",
                "networkType": "5G"
              },
              {
                "operatorName": "T-Mobile",
                "networkType": "5G"
              }
            ]
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 245,
      "totalPages": 5
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
        "package_code": "PHAJHEAYP",
        "name": "United States 1GB 7Days",
        "region": "United States",
        "type": "local",
        "data_amount_gb": 1,
        "validity_days": 7,
        "cost": 1901,
        "currency": "IQD",
        "features": {
          "voice_minutes": 0,
          "sms_count": 0,
          "is_rechargeable": true
        },
        "is_unlimited": false,
        "has_voice": false,
        "has_sms": false,
        "locationNetworkList": [
          {
            "locationName": "United States",
            "locationLogo": "/images/flags/us.png",
            "operatorList": [
              {
                "operatorName": "Verizon",
                "networkType": "5G"
              }
            ]
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 245,
      "totalPages": 5
    }
  }
}
```

### Package Fields

| Field | Type | Description |
|-------|------|-------------|
| package_code | String | Unique package identifier |
| name | String | Package display name |
| region | String | Region or country name |
| type | String | Package type ("local", "regional", "global") |
| data_amount_gb | Number | Data allowance in GB |
| validity_days | Integer | Validity period in days |
| cost | Number | Your cost price in user's preferred currency |
| currency | String | Currency code (USD or IQD based on user preference) |
| features | Object | Package features object |
| features.voice_minutes | Integer | Voice minutes included (0 if none) |
| features.sms_count | Integer | SMS messages included (0 if none) |
| features.is_rechargeable | Boolean | Whether package can be recharged |
| is_unlimited | Boolean | Unlimited data flag |
| has_voice | Boolean | Has voice minutes included |
| has_sms | Boolean | Has SMS included |
| locationNetworkList | Array | Detailed network coverage by location |

### LocationNetworkList Structure

| Field | Type | Description |
|-------|------|-------------|
| locationName | String | Country or location name |
| locationLogo | String | Flag image URL |
| operatorList | Array | List of network operators |
| operatorList[].operatorName | String | Network operator name |
| operatorList[].networkType | String | Network technology (e.g., "4G/5G") |

## Examples

### Search for United States Packages

```javascript
const queryParams = new URLSearchParams({
  search: 'United States',
  limit: 20
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims/packages?${queryParams}`,
  {
    headers: generateHMACHeaders() // Your HMAC function
  }
);
```

### Search for Regional Packages

```javascript
const queryParams = new URLSearchParams({
  search: 'Europe',
  limit: 50
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims/packages?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);
```

### Filter by Package Type

Get all local packages:
```javascript
const queryParams = new URLSearchParams({
  type: 'local',
  limit: 50
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims/packages?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);
```

Get all regional packages:
```javascript
const queryParams = new URLSearchParams({
  type: 'regional',
  limit: 50
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims/packages?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);
```

Get all global packages:
```javascript
const queryParams = new URLSearchParams({
  type: 'global',
  limit: 50
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims/packages?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);
```

### Combine Search and Type Filter

Search for United States packages with local type only:
```javascript
const queryParams = new URLSearchParams({
  search: 'United States',
  type: 'local',
  limit: 20
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/esims/packages?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);
```

## Pricing

The `cost` field shows your cost price. Apply your own profit margin when displaying prices to your customers.

## Package Types

### Local Packages (type: "local")
- Coverage for a single country
- Most cost-effective for single-destination travel
- Example: "United States 1GB - 7 Days"

### Regional Packages (type: "regional")
- Coverage for multiple countries in a region
- Ideal for multi-country travel
- Example: "Europe 5GB - 30 Days" (covers 40+ countries)

### Global Packages (type: "global")
- Worldwide coverage
- Premium pricing for maximum flexibility
- Example: "Discover Global 10GB - 30 Days" (covers 170+ countries)

## Filtering Best Practices

1. **For destination search**: Use `search` parameter with country name
2. **For package type filtering**: Use `type` parameter with values "local", "regional", or "global"
3. **Combine filters**: You can use both `search` and `type` together for precise results
4. **Pagination**: Use `page` and `limit` for large result sets (default 50, max 100)
5. **Caching**: Cache results for 5 minutes to reduce API calls

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

Duplicate request ID:
```json
{
  "success": false,
  "error": "Request ID has already been used",
  "code": "DUPLICATE_REQUEST"
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

Invalid HMAC signature:
```json
{
  "success": false,
  "error": "Invalid HMAC signature",
  "code": "INVALID_SIGNATURE"
}
```

Incomplete HMAC authentication:
```json
{
  "success": false,
  "error": "HMAC signature authentication required",
  "message": "Missing required headers: RT-Signature, RT-Timestamp, and RT-RequestID are mandatory when using RT-AccessCode",
  "code": "HMAC_REQUIRED"
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
  "error": "Failed to fetch packages"
}
```

## Notes

- **Multi-Currency Pricing**: Prices are shown in your preferred currency (USD or IQD)
- **Currency Conversion**: IQD prices are converted using real-time exchange rates
- **Currency Preference**: Set your preferred currency in the business dashboard settings
- Packages are sorted: local plans first (sorted by GB, then unlimited by days), followed by regional, then global
- Only packages with 1GB or more data are returned (small packages under 1GB are filtered out)
- Duplicate unlimited plans are filtered, showing only the cheapest option per duration
- The `cost` field shows your cost price (your profit margin is not exposed)
- Package availability may change based on provider stock
- Use the `type` parameter to filter packages by coverage type (local/regional/global)
- Combine `search` and `type` parameters for more precise filtering
- Use pagination for large result sets (7000+ packages available)
- Cache package data for 5 minutes to reduce API calls
- Use `locationNetworkList` for detailed network coverage information by location