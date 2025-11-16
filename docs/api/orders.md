---
sidebar_position: 4
title: Orders
---

# Orders

Retrieve your order history with detailed filtering and search options.

## Endpoint

```
GET /api/v1/business/orders
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
| page | Integer | 1 | Page number for pagination |
| limit | Integer | 20 | Number of results per page (max 100) |
| status | String | all | Filter by order status: "all", "pending", "completed", "failed", "cancelled" |
| from_date | String | - | Filter orders from this date (ISO 8601 format) |
| to_date | String | - | Filter orders until this date (ISO 8601 format) |
| search | String | - | Search in order_reference, package_name, or package_code |
| sort_by | String | created_at | Sort field: "created_at", "amount", "status" |
| sort_order | String | desc | Sort direction: "asc" or "desc" |

## Response

### Success Response (200 OK)

**USD User Example:**
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
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": 12346,
        "order_reference": "ES-1234567891-DEF",
        "package_name": "Europe Regional 5GB 30Days",
        "package_code": "EUROP5GB30",
        "amount": 5.50,
        "currency": "USD",
        "status": "completed",
        "flag_url": "/img/flags/EU.png",
        "created_at": "2024-01-14T15:45:00Z"
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

**IQD User Example:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 12347,
        "order_reference": "ES-1234567892-GHI",
        "package_name": "Iraq 2GB 15Days",
        "package_code": "IRQ2GB15",
        "amount": 6600,
        "currency": "IQD",
        "status": "completed",
        "flag_url": "/img/flags/IQ.png",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "summary": {
      "total_orders": 25,
      "total_revenue": 165000
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "total_pages": 2
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | Request success status |
| data.orders | Array | List of order objects |
| data.summary | Object | Summary statistics |
| data.pagination | Object | Pagination information |

### Order Object Fields

| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Order ID |
| order_reference | String | Unique order reference |
| package_name | String | eSIM package name |
| package_code | String | Package code |
| amount | Number | Order amount in user's preferred currency |
| currency | String | Order currency (USD or IQD based on user preference) |
| status | String | Order status |
| flag_url | String | Country flag image URL |
| created_at | String | Order creation timestamp (ISO 8601) |

### Summary Object Fields

| Field | Type | Description |
|-------|------|-------------|
| total_orders | Integer | Total completed orders count |
| total_revenue | Number | Total revenue from completed orders in user's preferred currency |

### Pagination Object Fields

| Field | Type | Description |
|-------|------|-------------|
| page | Integer | Current page number |
| limit | Integer | Items per page |
| total | Integer | Total number of orders |
| total_pages | Integer | Total number of pages |

## Examples

### Get Recent Orders

```javascript
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

async function getRecentOrders() {
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

  const response = await fetch('https://esimfly.net/api/v1/business/orders', {
    headers: {
      'RT-AccessCode': accessCode,
      'RT-RequestID': requestId,
      'RT-Timestamp': timestamp,
      'RT-Signature': signature
    }
  });

  const data = await response.json();
  console.log(`Found ${data.data.orders.length} orders`);
}
```

### Search Orders by Package

```javascript
const queryParams = new URLSearchParams({
  search: 'United States',
  limit: 50,
  sort_by: 'created_at',
  sort_order: 'desc'
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/orders?${queryParams}`,
  {
    headers: generateHMACHeaders() // Your HMAC function
  }
);
```

### Filter Orders by Date Range

```javascript
const queryParams = new URLSearchParams({
  from_date: '2024-01-01T00:00:00Z',
  to_date: '2024-01-31T23:59:59Z',
  status: 'completed',
  limit: 100
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/orders?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);
```

### Get Failed Orders

```javascript
const queryParams = new URLSearchParams({
  status: 'failed',
  sort_by: 'created_at',
  sort_order: 'desc'
});

const response = await fetch(
  `https://esimfly.net/api/v1/business/orders?${queryParams}`,
  {
    headers: generateHMACHeaders()
  }
);
```

### Paginate Through Orders

```javascript
async function getAllOrders() {
  let page = 1;
  let allOrders = [];
  let hasMore = true;

  while (hasMore) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: '100'
    });

    const response = await fetch(
      `https://esimfly.net/api/v1/business/orders?${queryParams}`,
      {
        headers: generateHMACHeaders()
      }
    );

    const data = await response.json();
    allOrders = allOrders.concat(data.data.orders);
    
    hasMore = page < data.data.pagination.total_pages;
    page++;
  }

  return allOrders;
}
```

### Python Example

```python
import hashlib
import hmac
import time
import uuid
import requests
from datetime import datetime, timedelta

def get_orders_last_7_days():
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
    
    # Get orders from last 7 days
    from_date = (datetime.now() - timedelta(days=7)).isoformat() + 'Z'
    params = {
        'from_date': from_date,
        'status': 'completed',
        'limit': 100
    }
    
    response = requests.get(
        'https://esimfly.net/api/v1/business/orders',
        headers=headers,
        params=params
    )
    
    data = response.json()
    print(f"Orders in last 7 days: {data['data']['pagination']['total']}")
    print(f"Total revenue: ${data['data']['summary']['total_revenue']}")
```

## Order Status Values

| Status | Description |
|--------|-------------|
| pending | Order created but payment not confirmed |
| completed | Order successfully completed and eSIM delivered |
| failed | Order failed due to payment or provisioning issue |
| cancelled | Order cancelled by user or system |

## Filtering and Sorting

### Date Filtering
- Use ISO 8601 format for dates (e.g., "2024-01-15T10:30:00Z")
- `from_date` is inclusive
- `to_date` is inclusive
- Both dates are optional and can be used independently

### Search Functionality
- Searches across order_reference, package_name, and package_code
- Case-insensitive search
- Partial matches are supported

### Sorting Options
- `sort_by`: Choose from "created_at", "amount", or "status"
- `sort_order`: Use "asc" for ascending or "desc" for descending
- Default: sorted by created_at in descending order (newest first)

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
  "error": "Failed to fetch orders"
}
```

## Rate Limiting

This endpoint is subject to the standard rate limit of 1000 requests per hour. Rate limit information is included in response headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when the limit resets

## Notes

- **Currency Filtering**: Only orders in your preferred currency are returned
- **Multi-Currency Support**: USD users see only USD orders, IQD users see only IQD orders
- **Currency Preference**: Set your preferred currency in the business dashboard settings
- Only your own orders are returned
- Summary statistics only include completed orders in your preferred currency
- Maximum 100 orders can be returned per request
- Use pagination to retrieve all orders
- The `flag_url` field may be null for some orders
- Consider caching order data for reporting purposes