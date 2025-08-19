---
sidebar_position: 2
title: API Authentication
---

# API Authentication

The eSIMfly Business API uses HMAC-SHA256 signature authentication to ensure maximum security for all API requests.

## Authentication Method

### HMAC Signature Authentication

eSIMfly Business API uses HMAC-SHA256 signature authentication to ensure maximum security. This method provides request integrity verification and prevents replay attacks.

**Required Headers:**
- `RT-AccessCode`: Your API access code
- `RT-RequestID`: Unique request ID (UUID v4)
- `RT-Signature`: HMAC-SHA256 signature
- `RT-Timestamp`: Request timestamp (milliseconds)

## HMAC Signature Calculation

The signature is calculated using HMAC-SHA256 with your secret key:

```
signData = Timestamp + RequestID + AccessCode + RequestBody
signature = HMACSHA256(signData, SecretKey)
```

### Step-by-Step Guide

1. **Generate a UUID v4 for the request ID**
2. **Get current timestamp in milliseconds**
3. **Concatenate the signing data**
4. **Calculate HMAC-SHA256 hash**
5. **Convert to uppercase hexadecimal**

### Implementation Examples

#### Node.js/JavaScript

```javascript
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

function generateHMACHeaders(accessCode, secretKey, requestBody = '') {
  const timestamp = Date.now().toString();
  const requestId = uuidv4();
  
  // Concatenate signing data
  const signData = timestamp + requestId + accessCode + requestBody;
  
  // Calculate HMAC-SHA256
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(signData)
    .digest('hex')
    .toUpperCase();
  
  return {
    'RT-AccessCode': accessCode,
    'RT-RequestID': requestId,
    'RT-Timestamp': timestamp,
    'RT-Signature': signature
  };
}

// Example usage
const headers = generateHMACHeaders(
  'esf_your_access_code',
  'sk_your_secret_key',
  JSON.stringify({ packageCode: 'PHAJHEAYP' })
);
```

#### Python

```python
import hashlib
import hmac
import time
import uuid
import json

def generate_hmac_headers(access_code, secret_key, request_body=''):
    timestamp = str(int(time.time() * 1000))
    request_id = str(uuid.uuid4())
    
    # Concatenate signing data
    sign_data = timestamp + request_id + access_code + request_body
    
    # Calculate HMAC-SHA256
    signature = hmac.new(
        secret_key.encode('utf-8'),
        sign_data.encode('utf-8'),
        hashlib.sha256
    ).hexdigest().upper()
    
    return {
        'RT-AccessCode': access_code,
        'RT-RequestID': request_id,
        'RT-Timestamp': timestamp,
        'RT-Signature': signature
    }

# Example usage
body = json.dumps({'packageCode': 'PHAJHEAYP'})
headers = generate_hmac_headers(
    'esf_your_access_code',
    'sk_your_secret_key',
    body
)
```

#### PHP

```php
function generateHMACHeaders($accessCode, $secretKey, $requestBody = '') {
    $timestamp = (string)(time() * 1000);
    $requestId = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4));
    
    // Concatenate signing data
    $signData = $timestamp . $requestId . $accessCode . $requestBody;
    
    // Calculate HMAC-SHA256
    $signature = strtoupper(hash_hmac('sha256', $signData, $secretKey));
    
    return [
        'RT-AccessCode' => $accessCode,
        'RT-RequestID' => $requestId,
        'RT-Timestamp' => $timestamp,
        'RT-Signature' => $signature
    ];
}

// Example usage
$body = json_encode(['packageCode' => 'PHAJHEAYP']);
$headers = generateHMACHeaders(
    'esf_your_access_code',
    'sk_your_secret_key',
    $body
);
```

## Signature Verification Example

Here's a complete example showing how the signature is calculated:

**Input Data:**
```
Timestamp: 1628670421000
RequestID: 4ce9d9cd-ac9e-4e17-b3a2-c66c358c1ce2
AccessCode: esf_11111
SecretKey: sk_1111
RequestBody: {"packageCode":"PHAJHEAYP"}
```

**Signing String:**
```
16286704210004ce9d9cd-ac9e-4e17-b3a2-c66c358c1ce2esf_11111{"packageCode":"PHAJHEAYP"}
```

**Calculated Signature:**
```
E8C3D2F91A5B4C7D8E9F0A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D
```

## Important Notes

1. **Timestamp Format**: Must be in milliseconds since Unix epoch (e.g., `1628670421000`)
2. **Request Timeout**: Requests older than 5 minutes are automatically rejected
3. **Request ID Format**: Must be a valid UUID v4 (e.g., `4ce9d9cd-ac9e-4e17-b3a2-c66c358c1ce2`)
4. **Signature Case**: Signatures must be uppercase hexadecimal
5. **Request Body**: For GET requests, use empty string. For POST/PUT, use the exact JSON body

## Security Best Practices

1. **Never expose your secret key** - Store it securely and never include it in client-side code
2. **Use HTTPS always** - All API requests must be made over HTTPS
3. **Implement request timeouts** - Requests older than 5 minutes are rejected
4. **Generate unique request IDs** - Each request must have a unique UUID v4
5. **Validate signatures server-side** - Always verify signatures on your backend
6. **Rotate keys regularly** - Change your API keys periodically
7. **Use IP whitelisting** - Restrict API access to known IP addresses when possible

## Error Responses

### Missing Authentication

```json
{
  "success": false,
  "error": "Authentication required",
  "message": "Please provide either Bearer token or complete HMAC signature authentication"
}
```

### Incomplete HMAC Authentication

```json
{
  "success": false,
  "error": "HMAC signature authentication required",
  "message": "Missing required headers: RT-Signature, RT-Timestamp, and RT-RequestID are mandatory when using RT-AccessCode",
  "code": "HMAC_REQUIRED"
}
```

### Invalid API Key

```json
{
  "success": false,
  "error": "Invalid API key",
  "code": "INVALID_API_KEY"
}
```

### Invalid Signature

```json
{
  "success": false,
  "error": "Invalid signature",
  "code": "INVALID_SIGNATURE"
}
```

### Invalid Request ID

```json
{
  "success": false,
  "error": "Invalid or missing RT-RequestID header. Must be a valid UUID v4.",
  "code": "INVALID_REQUEST_ID"
}
```

### Timestamp Errors

```json
{
  "success": false,
  "error": "Request timestamp is too old or invalid",
  "code": "INVALID_TIMESTAMP"
}
```

### Duplicate Request

```json
{
  "success": false,
  "error": "Request ID has already been used",
  "code": "DUPLICATE_REQUEST"
}
```

### Not a Business Account

```json
{
  "success": false,
  "error": "Invalid user or not a business account",
  "code": "INVALID_USER"
}
```

## Rate Limiting

All API endpoints are rate-limited to prevent abuse:

- **Rate limit**: 1000 requests per hour

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when the limit resets (ISO 8601)

## Getting Your API Credentials

1. Log in to your eSIMfly Business Dashboard
2. Navigate to **Settings** → **API Keys**
3. Click **Create New API Key**
4. Save your `access_code` and `secret_key` securely
5. The secret key is only shown once - store it safely!

## Next Steps

- [Quick Start](/docs/quick-start) - Get started quickly
- [API Reference](/docs/api-reference) - Explore all available endpoints
- [Examples](/docs/examples) - See complete integration examples
- [Test Your API](https://esimfly.net/business-dashboard/api-test) - Test your connection