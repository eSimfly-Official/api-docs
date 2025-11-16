---
sidebar_position: 6
title: Error Codes & Handling
description: Complete reference for eSIMfly API error codes and best practices for error handling
---

# Error Codes & Response Standards

Understanding error responses and how to handle them properly is crucial for building robust integrations with the eSIMfly API.

## Response Structure

### Success Response

All successful API calls return a response with `success: true`:

```json
{
  "success": true,
  "data": {
    // Response data varies by endpoint
  }
}
```

### Error Response

Failed requests return `success: false` with error details:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional context when available
  }
}
```

## HTTP Status Codes

| Status Code | Meaning | When It Occurs |
|------------|---------|----------------|
| **200** | OK | Request succeeded |
| **400** | Bad Request | Invalid request parameters |
| **401** | Unauthorized | Invalid or missing authentication |
| **403** | Forbidden | Valid auth but insufficient permissions |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Resource already exists or state conflict |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server-side error |
| **503** | Service Unavailable | Temporary service disruption |

## Error Codes Reference

### Authentication Errors

| Code | Message | Solution |
|------|---------|----------|
| `AUTH_MISSING` | Missing authentication headers | Include all required RT-* headers |
| `AUTH_INVALID_SIGNATURE` | Invalid signature | Check your signature calculation |
| `AUTH_EXPIRED_TIMESTAMP` | Request timestamp expired | Timestamp must be within 5 minutes |
| `AUTH_INVALID_ACCESS_CODE` | Invalid access code | Verify your access code from dashboard |
| `AUTH_DUPLICATE_REQUEST_ID` | Duplicate request ID | Use unique UUID for each request |

### Validation Errors

| Code | Message | Solution |
|------|---------|----------|
| `VALIDATION_FAILED` | Request validation failed | Check required fields and formats |
| `INVALID_PACKAGE_CODE` | Invalid package code | Verify package exists using packages endpoint |
| `INVALID_COUNTRY_CODE` | Invalid country code | Use ISO Alpha-2 country codes |
| `INVALID_QUANTITY` | Invalid quantity | Quantity must be positive integer |
| `INVALID_ICCID` | Invalid ICCID format | Check ICCID format (19-20 digits) |

### Business Logic Errors

| Code | Message | Solution |
|------|---------|----------|
| `INSUFFICIENT_BALANCE` | Insufficient account balance | Top up your account balance |
| `PACKAGE_NOT_AVAILABLE` | Package temporarily unavailable | Try alternative package or contact support |
| `ESIM_NOT_FOUND` | eSIM not found | Verify ICCID belongs to your account |
| `ESIM_ALREADY_ACTIVE` | eSIM already activated | Cannot reactivate active eSIM |
| `TOPUP_NOT_ALLOWED` | Top-up not allowed for this eSIM | Check eSIM status and provider support |
| `ORDER_PROCESSING` | Order is still processing | Wait for order completion before retry |

### Rate Limiting Errors

| Code | Message | Solution |
|------|---------|----------|
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait for rate limit reset (check headers) |
| `DAILY_LIMIT_EXCEEDED` | Daily quota exceeded | Upgrade plan or wait for reset |

### System Errors

| Code | Message | Solution |
|------|---------|----------|
| `PROVIDER_ERROR` | Upstream provider error | Retry with exponential backoff |
| `SYSTEM_ERROR` | Internal system error | Contact support if persists |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | Retry after indicated time |

## Error Handling Best Practices

### 1. Always Check Success Flag

```javascript
const response = await fetch('https://esimfly.net/api/v1/business/balance', options);
const data = await response.json();

if (!data.success) {
  console.error(`Error: ${data.error} (${data.code})`);
  // Handle error based on code
  return;
}

// Process successful response
console.log('Balance:', data.data.balance);
```

### 2. Implement Retry Logic

For certain errors, automatic retry with exponential backoff is recommended:

```javascript
async function apiRequestWithRetry(url, options, maxRetries = 3) {
  const retryableCodes = ['PROVIDER_ERROR', 'SERVICE_UNAVAILABLE'];

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (data.success) return data;

      // Don't retry if error is not retryable
      if (!retryableCodes.includes(data.code)) {
        throw new Error(data.error);
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### 3. Handle Rate Limiting

```javascript
const response = await fetch(url, options);

if (response.status === 429) {
  const resetTime = response.headers.get('X-RateLimit-Reset');
  const waitTime = resetTime - Math.floor(Date.now() / 1000);

  console.log(`Rate limited. Waiting ${waitTime} seconds...`);
  await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

  // Retry request
  return fetch(url, options);
}
```

### 4. Log Errors for Debugging

Always log enough context to debug issues:

```javascript
if (!data.success) {
  console.error({
    timestamp: new Date().toISOString(),
    endpoint: url,
    errorCode: data.code,
    errorMessage: data.error,
    requestId: options.headers['RT-RequestID'],
    details: data.details
  });
}
```

### 5. User-Friendly Error Messages

Map API errors to user-friendly messages:

```javascript
const errorMessages = {
  'INSUFFICIENT_BALANCE': 'Your account balance is too low. Please add funds.',
  'INVALID_PACKAGE_CODE': 'The selected package is not available.',
  'RATE_LIMIT_EXCEEDED': 'Too many requests. Please try again in a moment.',
  'PROVIDER_ERROR': 'Temporary service issue. Please try again.',
};

function getUserMessage(errorCode) {
  return errorMessages[errorCode] || 'An unexpected error occurred. Please contact support.';
}
```

## Rate Limit Headers

Every API response includes rate limit information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1628674021
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed per hour |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |

## Testing Error Scenarios

Use these test scenarios in your integration:

1. **Invalid Authentication**: Send request with wrong signature
2. **Insufficient Balance**: Attempt order with $0 balance
3. **Invalid Package**: Use non-existent package code
4. **Duplicate Request ID**: Send same request ID twice
5. **Rate Limiting**: Send 1001 requests in one hour

## Common Error Scenarios

### Scenario 1: Authentication Failed

**Problem**: Getting `AUTH_INVALID_SIGNATURE`

**Common Causes**:
- Incorrect signature calculation
- Using wrong timestamp format
- Access code mismatch
- Character encoding issues

**Solution**:
```javascript
// Correct signature calculation
const payload = `${accessCode}${requestId}${timestamp}`;
const signature = crypto
  .createHmac('sha256', secretKey)
  .update(payload)
  .digest('hex');
```

### Scenario 2: Order Failed After Payment

**Problem**: Payment succeeded but order not created

**Action**:
1. Check order status via `/orders` endpoint
2. Verify payment in dashboard
3. Contact support with Request ID if issue persists

**Prevention**:
- Implement webhook listeners for order status
- Store Request IDs for tracking
- Don't retry order creation automatically

### Scenario 3: eSIM Not Received

**Problem**: Order succeeded but eSIM data not available

**Typical Cause**: Provider delay (rare)

**Solution**:
- Most eSIMs are instant
- Some providers may take 1-5 minutes
- Check `/esims` endpoint after 5 minutes
- Contact support if > 10 minutes

## Support

If you encounter persistent errors:

1. **Check API Status**: [status.esimfly.net](https://status.esimfly.net)
2. **Review Logs**: Include Request ID in support tickets
3. **Contact Support**: support@esimfly.net
4. **Live Chat**: Available in Business Dashboard

## Related Documentation

- [Authentication Guide](/docs/api-authentication)
- [Best Practices](/docs/best-practices)
- [Webhooks](/docs/webhooks)
