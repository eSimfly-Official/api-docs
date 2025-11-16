---
sidebar_position: 1
title: Balance Query
---

# Balance Query

Check your account balance.

## Endpoint

```
GET /api/v1/business/balance
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

## Response

### Success Response (200 OK)

**USD User Example:**
```json
{
  "success": true,
  "data": {
    "balance": 1500.00,
    "currency": "USD"
  }
}
```

**IQD User Example:**
```json
{
  "success": true,
  "data": {
    "balance": 1980000,
    "currency": "IQD"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | Request success status |
| data.balance | Number | Current account balance in user's preferred currency |
| data.currency | String | Currency code based on user's preference (USD or IQD) |

## Examples

### Node.js

```javascript
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

async function checkBalance() {
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

  const response = await fetch('https://esimfly.net/api/v1/business/balance', {
    headers: {
      'RT-AccessCode': accessCode,
      'RT-RequestID': requestId,
      'RT-Timestamp': timestamp,
      'RT-Signature': signature
    }
  });

  const data = await response.json();
  console.log('Current balance:', data.data.balance, data.data.currency);
}
```

### Python

```python
import hashlib
import hmac
import time
import uuid
import requests

def check_balance():
    access_code = 'esf_your_access_code'
    secret_key = 'sk_your_secret_key'
    
    # Generate HMAC headers
    timestamp = str(int(time.time() * 1000))
    request_id = str(uuid.uuid4())
    sign_data = timestamp + request_id + access_code
    signature = hmac.new(
        secret_key.encode('utf-8'),
        sign_data.encode('utf-8'),
        hashlib.sha256
    ).hexdigest().upper()
    
    headers = {
        'RT-AccessCode': access_code,
        'RT-RequestID': request_id,
        'RT-Timestamp': timestamp,
        'RT-Signature': signature
    }
    
    response = requests.get(
        'https://esimfly.net/api/v1/business/balance',
        headers=headers
    )
    
    data = response.json()
    print(f"Current balance: {data['data']['balance']} {data['data']['currency']}")
```

### PHP

```php
function checkBalance() {
    $accessCode = 'esf_your_access_code';
    $secretKey = 'sk_your_secret_key';
    
    // Generate HMAC headers
    $timestamp = (string)(time() * 1000);
    $requestId = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4));
    $signData = $timestamp . $requestId . $accessCode;
    $signature = strtoupper(hash_hmac('sha256', $signData, $secretKey));
    
    $headers = [
        'RT-AccessCode: ' . $accessCode,
        'RT-RequestID: ' . $requestId,
        'RT-Timestamp: ' . $timestamp,
        'RT-Signature: ' . $signature
    ];
    
    $ch = curl_init('https://esimfly.net/api/v1/business/balance');
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $data = json_decode($response, true);
    
    echo "Current balance: " . $data['data']['balance'] . " " . $data['data']['currency'];
}
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

Duplicate request ID (replay attack prevention):
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

Token expired (JWT auth):
```json
{
  "success": false,
  "message": "Token not found or expired"
}
```

Invalid token (JWT auth):
```json
{
  "success": false,
  "message": "Invalid token"
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

### 404 Not Found

User not found:
```json
{
  "success": false,
  "error": "User not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to fetch balance"
}
```

## Rate Limiting

This endpoint is subject to the standard rate limit of 1000 requests per hour. Rate limit information is included in response headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when the limit resets

## Notes

- Balance is returned in the user's preferred currency (USD or IQD)
- Currency preference can be set in the business dashboard settings
- This endpoint returns real-time balance information from the multi-currency wallet system
- Use this endpoint to verify funds before placing orders
- IQD balances are shown as whole numbers (no decimals)
- USD balances are shown with 2 decimal places