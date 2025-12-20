---
sidebar_position: 3
title: Create Order
---

# Create Order

Create a new eSIM order using your account balance.

## Endpoint

```
POST /api/v1/business/esims/order
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
| Content-Type | String | Yes | Must be "application/json" |

## Request Body

Simply provide the package code - everything else is handled automatically.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| packageCode | String | **Yes** | Package code from the packages endpoint |
| quantity | Integer | No | Number of eSIMs to order (default: 1, max: 10) |

The API automatically handles:
- ✅ Package name lookup
- ✅ Price calculation
- ✅ Flag URL from database
- ✅ Duration detection

### Request Examples

**Single eSIM:**
```json
{
  "packageCode": "TR1GB7D"
}
```

**Multiple eSIMs:**
```json
{
  "packageCode": "merhaba-15days-2gb",
  "quantity": 3
}
```

## Response

### Success Response (200 OK)

**USD User Example:**
```json
{
  "success": true,
  "message": "Order processed successfully",
  "orderReference": "order_1692123456_ab7cd",
  "esimId": 2503,
  "packageName": "Turkey 1 GB 7 Days",
  "newBalance": 47.28,
  "currency": "USD",
  "lpaString": "LPA:1$rsp-3104.idemia.io$DOAZJ-HYDO5-HGMLN-S9B8S",
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgo...",
  "directAppleInstallUrl": "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA:1$rsp-3104.idemia.io$DOAZJ-HYDO5-HGMLN-S9B8S",
  "paymentMethod": "balance",
  "status": "completed",
  "amount": 2.72,
  "profit": 0.20,
  "final_price": 2.72,
  "processing_time_ms": 3245,
  "esims": [
    {
      "iccid": "8932042000010078801",
      "lpaString": "LPA:1$rsp-3104.idemia.io$DOAZJ-HYDO5-HGMLN-S9B8S",
      "qrCodeUrl": "data:image/png;base64,iVBORw0KGgo...",
      "directAppleInstallUrl": "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA:1$rsp-3104.idemia.io$DOAZJ-HYDO5-HGMLN-S9B8S",
      "status": "New",
      "profileStatus": "nodownload",
      "isPending": false
    }
  ]
}
```

**IQD User Example:**
```json
{
  "success": true,
  "message": "Order processed successfully",
  "orderReference": "order_1756393024924_wmdq2",
  "esimId": 2604,
  "packageName": "Turkey 1GB 7Days",
  "newBalance": 203488,
  "currency": "IQD",
  "lpaString": "LPA:1$rsp-3104.idemia.io$DOAZJ-HYDO5-HGMLN-S9B8S",
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgo...",
  "directAppleInstallUrl": "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA:1$rsp-3104.idemia.io$DOAZJ-HYDO5-HGMLN-S9B8S",
  "paymentMethod": "balance",
  "status": "completed",
  "amount": 969,
  "profit": 91,
  "final_price": 969,
  "processing_time_ms": 3245,
  "esims": [
    {
      "iccid": "8910300000037870123",
      "lpaString": "LPA:1$rsp-3104.idemia.io$DOAZJ-HYDO5-HGMLN-S9B8S",
      "qrCodeUrl": "data:image/png;base64,iVBORw0KGgo...",
      "directAppleInstallUrl": "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA:1$rsp-3104.idemia.io$DOAZJ-HYDO5-HGMLN-S9B8S",
      "status": "New",
      "profileStatus": "nodownload",
      "isPending": false
    }
  ]
}
```

### Pending Response (200 OK)

When eSIM details are being processed:

```json
{
  "success": true,
  "message": "Order created successfully, eSIM details will be available shortly",
  "orderReference": "order_1692123456_ab7cd",
  "esimId": 2503,
  "packageName": "Turkey 1 GB 7 Days",
  "newBalance": 204000,
  "currency": "IQD",
  "qrCodeUrl": "",
  "directAppleInstallUrl": "",
  "paymentMethod": "balance",
  "status": "pending_details",
  "amount": 969,
  "profit": 91,
  "final_price": 969,
  "processing_time_ms": 1523,
  "note": "The order was placed successfully but eSIM details are being processed. Please check order status in a few minutes.",
  "esims": [
    {
      "iccid": "PENDING_B25081719340002_1755459260253",
      "qrCodeUrl": "",
      "directAppleInstallUrl": "",
      "status": "PENDING",
      "isPending": true
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | Request success status |
| message | String | Human-readable status message |
| orderReference | String | Unique order reference for tracking |
| esimId | Integer | Primary eSIM ID (for single eSIM orders) |
| packageName | String | Ordered package name |
| newBalance | Number | Your updated account balance in preferred currency |
| currency | String | Currency code (USD or IQD based on user preference) |
| lpaString | String | Raw LPA string (e.g., "LPA:1$smdp.address$activation-code") for QR code generation |
| qrCodeUrl | String | Base64-encoded QR code image (data:image/png;base64,...) |
| directAppleInstallUrl | String | Direct iPhone installation URL |
| paymentMethod | String | Always "balance" for business orders |
| status | String | Order status ("completed" or "pending_details") |
| amount | Number | Total order amount in user's preferred currency |
| profit | Number | Your profit amount in user's preferred currency |
| final_price | Number | Final price charged to your balance in preferred currency |
| processing_time_ms | Integer | Order processing time in milliseconds |
| esims | Array | Array of eSIM details |
| note | String | Additional information (for pending orders) |

### eSIM Object Fields

| Field | Type | Description |
|-------|------|-------------|
| iccid | String | eSIM ICCID number |
| lpaString | String | Raw LPA string for QR code generation (format: "LPA:1$smdp.address$activation-code") |
| qrCodeUrl | String | Base64-encoded QR code image |
| directAppleInstallUrl | String | Direct Apple installation URL |
| status | String | eSIM status ("New" or "PENDING") |
| profileStatus | String | Profile download status ("nodownload", "downloaded", "activated", etc.) |
| isPending | Boolean | Whether eSIM details are still being processed |

**Using the LPA String:**
- Extract SMDP address: Split by `$` and get second part
- Extract activation code: Split by `$` and get third part
- Generate your own QR code using the full LPA string
- Display to users for manual entry

## Order Status Checking

You can check the status of any order using the order reference:

```
GET /api/v1/business/esims/order?orderReference={orderReference}
```

### Status Check Response

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

## Examples

### Basic Order Creation

```javascript
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

async function createOrder(packageCode, quantity = 1) {
  const accessCode = 'esf_your_access_code';
  const secretKey = 'sk_your_secret_key';

  // Simple order data - just packageCode!
  const orderData = {
    packageCode: packageCode,
    quantity: quantity
  };
  
  // Generate HMAC headers
  const timestamp = Date.now().toString();
  const requestId = uuidv4();
  const requestBody = JSON.stringify(orderData);
  const signData = timestamp + requestId + accessCode + requestBody;
  const signature = crypto.createHmac('sha256', secretKey)
    .update(signData)
    .digest('hex')
    .toUpperCase();

  const response = await fetch('https://esimfly.net/api/v1/business/esims/order', {
    method: 'POST',
    headers: {
      'RT-AccessCode': accessCode,
      'RT-RequestID': requestId,
      'RT-Timestamp': timestamp,
      'RT-Signature': signature,
      'Content-Type': 'application/json'
    },
    body: requestBody
  });

  const result = await response.json();
  
  if (result.success) {
    console.log(`Order created: ${result.orderReference}`);
    console.log(`New balance: $${result.newBalance}`);
    console.log(`Profit earned: $${result.profit}`);
    
    // Save eSIM details for customer
    result.esims.forEach((esim, index) => {
      console.log(`eSIM ${index + 1}: ${esim.iccid}`);
      console.log(`QR Code: ${esim.qrCodeUrl}`);
    });
  }
  
  return result;
}
```

### Multiple eSIM Order

```javascript
const result = await createOrder("europe-5gb-30days", 5);

if (result.success) {
  console.log(`Created ${result.esims.length} eSIMs`);
  console.log(`Total cost: $${result.final_price}`);
  console.log(`Total profit: $${result.profit}`);
}
```

### Check Order Status

```javascript
async function checkOrderStatus(orderReference) {
  const response = await fetch(
    `https://esimfly.net/api/v1/business/esims/order?orderReference=${orderReference}`,
    {
      headers: generateHMACHeaders() // Your HMAC function
    }
  );

  const data = await response.json();
  
  if (data.success) {
    console.log(`Order Status: ${data.order.status}`);
    console.log(`Payment Status: ${data.order.paymentStatus}`);
    console.log(`eSIM Status: ${data.order.esim.status}`);
  }
  
  return data;
}
```

### Python Example

```python
import hashlib
import hmac
import json
import time
import uuid
import requests

def create_esim_order(package_code, quantity=1):
    access_code = 'esf_your_access_code'
    secret_key = 'sk_your_secret_key'

    # Simple order data - just packageCode!
    order_data = {
        'packageCode': package_code,
        'quantity': quantity
    }
    
    # Generate HMAC headers
    timestamp = str(int(time.time() * 1000))
    request_id = str(uuid.uuid4())
    request_body = json.dumps(order_data)
    sign_data = timestamp + request_id + access_code + request_body
    signature = hmac.new(
        secret_key.encode('utf-8'),
        sign_data.encode('utf-8'),
        hashlib.sha256
    ).hexdigest().upper()
    
    headers = {
        'RT-AccessCode': access_code,
        'RT-RequestID': request_id,
        'RT-Timestamp': timestamp,
        'RT-Signature': signature,
        'Content-Type': 'application/json'
    }
    
    response = requests.post(
        'https://esimfly.net/api/v1/business/esims/order',
        headers=headers,
        json=order_data
    )
    
    data = response.json()
    
    if data['success']:
        print(f"Order created: {data['orderReference']}")
        print(f"New balance: ${data['newBalance']}")
        print(f"Profit: ${data['profit']}")
        
        for i, esim in enumerate(data['esims']):
            print(f"eSIM {i+1}: {esim['iccid']}")
    
    return data

# Example usage
result = create_esim_order(
    package_code='merhaba-7days-1gb',
    quantity=1
)
```

## Error Responses

### 400 Bad Request

Missing packageCode:
```json
{
  "success": false,
  "message": "Missing required field: packageCode",
  "code": "MISSING_PACKAGE_CODE"
}
```

Invalid package code:
```json
{
  "success": false,
  "message": "Invalid package code. Package not found in database.",
  "code": "INVALID_PACKAGE"
}
```

Price mismatch (security validation):
```json
{
  "success": false,
  "message": "Invalid price submitted",
  "code": "PRICE_MISMATCH"
}
```

Insufficient balance:
```json
{
  "success": false,
  "message": "Insufficient balance",
  "code": "INSUFFICIENT_BALANCE",
  "currentBalance": 25.50,
  "requiredBalance": 27.20,
  "needToLoad": 1.70
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

Invalid HMAC signature:
```json
{
  "success": false,
  "error": "Invalid HMAC signature",
  "code": "INVALID_SIGNATURE"
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

Order processing error:
```json
{
  "success": false,
  "message": "Failed to process order",
  "code": "ORDER_PROCESSING_ERROR"
}
```

## Order Flow

1. **Get Packages**: Use `/packages` endpoint to get available packages
2. **Select Package**: Choose a package and extract the required fields
3. **Create Order**: Submit order with exact package details
4. **Balance Deduction**: Your balance is automatically deducted
5. **eSIM Provisioning**: eSIM is provisioned from the provider
6. **Response**: Receive eSIM details or pending status
7. **Status Check**: Monitor order status if initially pending

## Security Features

### Price Validation
- Server-side price validation prevents price manipulation
- Submitted price must match the current package price
- Prices are validated against live package data

### Balance Safety
- Balance is checked before processing
- Atomic transaction ensures balance consistency
- No partial deductions on failed orders

### Request Deduplication
- Each request requires a unique UUID v4 request ID
- Duplicate request IDs are rejected to prevent accidental reorders
- Request IDs are stored for 24 hours

## Best Practices

### 1. Get Fresh Package Data
```javascript
// Get available packages
const packages = await getPackages({ search: 'Turkey' });
const selectedPackage = packages.data.packages[0];

// Create order with just package code
const order = await createOrder(selectedPackage.package_code);

// Or with quantity
const order = await createOrder(selectedPackage.package_code, 3);
```

### 2. Handle Pending Orders
```javascript
const result = await createOrder(orderData);

if (result.status === 'pending_details') {
  console.log('Order created, waiting for eSIM details...');
  
  // Check status after a delay
  setTimeout(async () => {
    const status = await checkOrderStatus(result.orderReference);
    if (status.order.status === 'completed') {
      console.log('eSIM details now available!');
    }
  }, 60000); // Check after 1 minute
}
```

### 3. Monitor Your Balance
```javascript
const result = await createOrder(orderData);

if (result.success) {
  console.log(`Order total: $${result.final_price}`);
  console.log(`Profit earned: $${result.profit}`);
  console.log(`Remaining balance: $${result.newBalance}`);
  
  // Alert if balance is low
  if (result.newBalance < 10) {
    console.warn('Low balance! Consider topping up.');
  }
}
```

### 4. Store eSIM Details Securely
```javascript
const result = await createOrder(orderData);

if (result.success) {
  // Store eSIM details in your database
  for (const esim of result.esims) {
    await storeEsimForCustomer({
      customerEmail: customerEmail,
      packageName: result.packageName,
      iccid: esim.iccid,
      qrCodeUrl: esim.qrCodeUrl,
      installUrl: esim.directAppleInstallUrl,
      orderReference: result.orderReference
    });
  }
}
```

## Package Code Requirements

### Important Notes
- Use the exact `package_code` from the packages endpoint
- Do not modify or prefix package codes
- Package codes are handled automatically by our system
- All package formats are supported

## Quantity Limits

- **Minimum**: 1 eSIM per order
- **Maximum**: 10 eSIMs per order
- **Multiple Orders**: For larger quantities, create multiple orders
- **Same ICCID**: Each eSIM in an order has a unique ICCID

## Rate Limiting

This endpoint is subject to:
- **1000 requests per hour** per API key
- **Rate limit headers** included in responses

## Troubleshooting

### Common Issues

1. **Invalid Package Code**
   - Verify package code exists in packages endpoint
   - Use exact `package_code` from packages response
   - Package availability may change

2. **Insufficient Balance**
   - Check your balance with `/balance` endpoint
   - Top up your account before placing orders

3. **Price Mismatch Error** (Standard Mode only)
   - Only occurs if you send `price` field manually
   - Use simplified mode (packageCode only) to avoid this

### Error Handling Example

```javascript
try {
  const result = await createOrder('merhaba-7days-1gb');

  if (!result.success) {
    switch (result.code) {
      case 'INSUFFICIENT_BALANCE':
        console.error(`Need to top up: $${result.needToLoad}`);
        break;
      case 'INVALID_PACKAGE':
        console.error('Package no longer available');
        break;
      default:
        console.error('Order failed:', result.message);
    }
  }
} catch (error) {
  console.error('Network error:', error.message);
}
```

## Legacy Integration Note

If you have an existing integration that sends additional fields like `packageName`, `price`, `duration`, or `flagUrl`, it will continue to work without any changes. The API is fully backward compatible.

For new integrations, we recommend using only `packageCode` (and optionally `quantity`) as shown in the examples above for simpler implementation.

## Support

For technical support or questions about the order API:
- **Email**: support@esimfly.net
- **Response Time**: 24 hours
- **Documentation**: https://docs.esimfly.net
