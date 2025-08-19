---
sidebar_position: 1
title: Introduction
---

# eSIMfly Business API

Deliver eSIM data packages via the eSIMfly Business API. Step-by-step overview.

## Quick Start

1. **Create an account** at [eSIMfly Business](https://esimfly.net/signup)
2. **Deposit funds** for testing
3. **Copy your Access Code** from Settings → API Keys
4. **Make your first API call**:

```bash
curl --location 'https://esimfly.net/api/v1/business/balance' \
--header 'RT-AccessCode: YOUR_ACCESS_CODE' \
--header 'RT-RequestID: 550e8400-e29b-41d4-a716-446655440000' \
--header 'RT-Timestamp: 1628670421000' \
--header 'RT-Signature: YOUR_CALCULATED_SIGNATURE'
```

## Version - V1

**Version 1.0** - August 2025 - Initial Release
- HMAC-SHA256 authentication
- Balance query endpoint
- Package listing with profit margins
- eSIM ordering and management
- eSIM topup functionality
- Order history tracking

## Environments and Endpoints

**Production:**
- Base URL: `https://esimfly.net/api/v1/business`
- Rate Limit: 1000 requests per hour

**Test Environment:**
- Use your live environment for testing
- Request test funds from support

## Authentication

All API requests require HMAC-SHA256 signature authentication using:
- `RT-AccessCode`: Your API access code
- `RT-RequestID`: Unique request ID (UUID v4)
- `RT-Timestamp`: Request timestamp in milliseconds
- `RT-Signature`: HMAC-SHA256 signature

[Learn more about authentication →](/docs/api-authentication)

## Standards

- **Time codes**: UTC format
- **Country codes**: ISO Alpha-2
- **Data values**: Gigabytes (GB)
- **Currency**: USD

## Rate Limit

1000 API requests per hour are allowed. Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE" // Optional error code
}
```

## Main Endpoints

### Balance Management
- `GET /balance` - Check account balance

### Package Management
- `GET /esims/packages` - List available packages with pricing

### eSIM Operations
- `POST /esims/order` - Order new eSIMs
- `GET /esims` - List your eSIMs
- `GET /orders` - View order history

### eSIM Topup Operations
- `GET /topup/packages` - Get available topup packages for an eSIM
- `POST /topup/order` - Process topup orders

## Support

- 📧 **Email**: support@esimfly.net
- 💬 **Live Chat**: Available in dashboard
- 🧪 **Test Tool**: [API Test Page](https://esimfly.net/business-dashboard/api-test)