---
sidebar_position: 3
title: API Reference
---

# API Reference

Base URL: `https://esimfly.net/api/v1/business`

All API requests must include authentication headers as described in the [Authentication](/docs/api-authentication) guide.

## Account Management

### Get Account Balance

Get current account balance and currency information.

**Endpoint:** `GET /balance`

See [Balance Query](/docs/api/balance) for detailed documentation.

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 1500.00,
    "currency": "USD"
  }
}
```

*Note: Currency and balance amount depend on user's preferred currency setting (USD or IQD)*

## eSIM Management

### Get All Packages

Retrieve available eSIM packages with your pricing.

**Endpoint:** `GET /esims/packages`

See [Get All Packages](/docs/api/packages) for detailed documentation.

**Query Parameters:**
- `search` (optional): Search packages by country name or destination
- `type` (optional): Filter by package type: "local", "regional", or "global"
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of results per page (default: 50, max: 100)

**Response:**
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
        "locationNetworkList": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 245,
      "total_pages": 5
    }
  }
}
```

### Create Order

Create a new eSIM order using your account balance.

**Endpoint:** `POST /esims/order`

See [Create Order](/docs/api/create-order) for detailed documentation.

**Request Body:**
```json
{
  "packageCode": "merhaba-7days-1gb",
  "packageName": "Turkey 1 GB 7 Days", 
  "price": 2.72,
  "quantity": 1,
  "duration": 7,
  "flagUrl": "/img/flags/tr.png"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order processed successfully",
  "orderReference": "order_1692123456_ab7cd",
  "esimId": 2503,
  "packageName": "Turkey 1 GB 7 Days",
  "newBalance": 47.28,
  "currency": "USD",
  "qrCodeUrl": "https://qr.example.com/esim-qr-code.png",
  "directAppleInstallUrl": "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA:1$...",
  "paymentMethod": "balance",
  "status": "completed",
  "amount": 2.72,
  "profit": 0.2,
  "final_price": 2.72,
  "processing_time_ms": 3245,
  "esims": [
    {
      "iccid": "8932042000010078801",
      "qrCodeUrl": "https://qr.example.com/esim-qr-code.png",
      "directAppleInstallUrl": "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA:1$...",
      "status": "New",
      "isPending": false
    }
  ]
}
```

*Note: For IQD users, amounts would be shown in Iraqi Dinars and currency would be "IQD"*

### Check Order Status

Check the status of a specific order.

**Endpoint:** `GET /esims/order?orderReference={orderReference}`

**Response:**
```json
{
  "success": true,
  "order": {
    "id": 2503,
    "packageName": "Turkey 1 GB 7 Days",
    "packageCode": "merhaba-7days-1gb",
    "status": "completed",
    "amount": 2.72,
    "finalPrice": 2.72,
    "orderDate": "2024-08-17T20:12:00Z",
    "orderReference": "order_1692123456_ab7cd",
    "paymentMethod": "balance",
    "paymentStatus": "succeeded",
    "esim": {
      "iccid": "8932042000010078801",
      "status": "New",
      "qrCodeUrl": "https://qr.example.com/esim-qr-code.png",
      "directAppleInstallUrl": "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA:1$...",
      "unlimited": false,
      "totalVolume": 1073741824,
      "totalDuration": 7,
      "expiredTime": "2025-02-13T20:12:00Z"
    }
  }
}
```

### Get Topup Packages

Retrieve available top-up packages for a specific eSIM.

**Endpoint:** `GET /topup/packages`

See [Get Topup Packages](/docs/api/topup-packages) for detailed documentation.

**Query Parameters:**
- `iccid` (required): eSIM ICCID to get compatible topup packages
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of results per page (default: 50, max: 100)

**Response:**
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
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 4,
      "total_pages": 1
    }
  }
}
```

*Note: For IQD users, cost would be shown in Iraqi Dinars (e.g., 13939 IQD) and currency would be "IQD"*

**Response:**
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
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 4,
      "total_pages": 1
    }
  }
}
```

### Process Topup Order

Process a top-up order for a specific eSIM with automatic profit calculation.

**Endpoint:** `POST /topup/order`

See [Process Topup Order](/docs/api/topup-order) for detailed documentation.

**Request Body:**
```json
{
  "iccid": "8943108170002570328",
  "packageCode": "TOPUP_PLGJ7UB3C",
  "packageName": "Iraq 1GB 7Days",
  "price": 3.68,
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "eSIM top-up processed successfully",
  "orderReference": "topup_1755559183090_vyf9w",
  "iccid": "8943108170002570328",
  "packageName": "Iraq 1GB 7Days",
  "newBalance": 550.68,
  "status": "completed",
  "amount": 3.68,
  "profit": 0.35,
  "processing_time_ms": 3724,
  "esimData": {
    "newTotalVolumeGB": 8.0,
    "newRemainingVolumeGB": 8.0,
    "expiredTime": "February 13, 2026 at 11:27 PM"
  }
}
```

### List eSIMs

Get a list of all eSIMs for your account with enhanced data including country coverage and detailed usage statistics.

**Endpoint:** `GET /esims`

See [List All eSIMs](/docs/api/esims) for detailed documentation.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (all, NEW, ACTIVE, EXPIRED, CANCELLED, DEPLETED, DELETED)
- `search` (optional): Search by ICCID, package name, or package code
- `include_base64` (optional): Include base64 QR code data (default: false)

**Response:**
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

### Query eSIM Usage

Get detailed usage information for a specific eSIM by ICCID or Order ID.

**Endpoint:** `GET /esims/usage/query`

See [Query eSIM Usage](/docs/api/esims-usage) for detailed documentation.

**Query Parameters:**
- `iccid` (optional*): ICCID of the eSIM to query
- `order_id` (optional*): Order ID associated with the eSIM
- `from_date` (optional): Start date for usage history (YYYY-MM-DD)
- `to_date` (optional): End date for usage history (YYYY-MM-DD)

*Either `iccid` or `order_id` is required.

**Response:**
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


## Orders

### List Orders

Get a list of all orders for your account with detailed filtering and search options.

**Endpoint:** `GET /orders`

See [Orders](/docs/api/orders) for detailed documentation.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (all, pending, completed, failed, cancelled)
- `from_date` (optional): Filter orders from this date (ISO 8601 format)
- `to_date` (optional): Filter orders until this date (ISO 8601 format)
- `search` (optional): Search in order_reference, package_name, or package_code
- `sort_by` (optional): Sort field (created_at, amount, status) - default: created_at
- `sort_order` (optional): Sort direction (asc, desc) - default: desc

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 12345,
        "order_reference": "ES-1234567890-ABC",
        "package_name": "United States 1GB 7Days",
        "package_code": "PHAJHEAYP",
        "amount": 1.44,
        "currency": "USD",
        "status": "completed",
        "flag_url": "/img/flags/US.png",
        "created_at": "2024-01-29T10:30:00Z"
      }
    ],
    "summary": {
      "total_orders": 156,
      "total_revenue": 1234.56
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "total_pages": 8
    }
  }
}
```

*Note: Orders are automatically filtered by your preferred currency. IQD users will only see IQD orders with amounts in Iraqi Dinars.*


## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details if available
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_API_KEY` | API key is invalid or not found |
| `INVALID_SIGNATURE` | HMAC signature verification failed |
| `INVALID_TIMESTAMP` | Request timestamp is too old |
| `DUPLICATE_REQUEST` | Request ID has already been used |
| `INSUFFICIENT_BALANCE` | Account balance is too low |
| `INVALID_PACKAGE` | Package code is invalid |
| `PRICE_MISMATCH` | Submitted price doesn't match package price |
| `ORDER_NOT_FOUND` | Order reference not found |
| `MISSING_FIELDS` | Required fields are missing |
| `ESIM_NOT_FOUND` | eSIM not found or access denied |
| `ESIM_NOT_TOPPABLE` | eSIM cannot be topped up (invalid status) |
| `INVALID_TOPUP_PACKAGE` | Topup package is invalid |
| `TOPUP_NOT_SUPPORTED` | Topups not available for this eSIM |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

## Pagination

Endpoints that return lists support pagination with these parameters:

- `page`: Page number (starts at 1)
- `limit`: Items per page (max 100)

Response includes pagination metadata:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```


## Rate Limits

- Default: 1000 requests per hour

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed (1000)
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when the limit resets (ISO 8601 format)

## Support

For API support:
- Email: support@esimfly.net
- Documentation: https://docs.esimfly.net