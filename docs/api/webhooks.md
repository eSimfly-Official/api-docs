---
sidebar_position: 9
title: Webhooks
---

# Webhooks

Receive real-time notifications when asynchronous events complete (e.g., KDDI Japan eSIM provisioning).

## Overview

Some eSIM providers (like KDDI for Japan) take 1-5 minutes to provision eSIM profiles. Instead of polling, you can configure a webhook URL to receive automatic notifications when the eSIM is ready.

**Flow:**
1. You place an order -> get `status: "pending_details"`
2. Our system provisions the eSIM in the background
3. When ready, we POST the eSIM details to your webhook URL
4. Your server receives the ICCID, QR code, and installation URLs

## Setup

### Option 1: Via API

```
PUT /api/v1/business/webhooks
```

```json
{
  "webhook_url": "https://your-server.com/api/esim-callback",
  "events": ["esim.provisioned"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook settings updated",
  "webhook": {
    "url": "https://your-server.com/api/esim-callback",
    "secret": "whsec_a1b2c3d4e5...",
    "events": ["esim.provisioned"]
  },
  "note": "Save your webhook_secret - it is used to verify webhook signatures via X-Webhook-Signature header."
}
```

### Option 2: Via Dashboard

Go to **Business Dashboard > Settings > API Keys** and click **"Set URL"** in the Webhook column for your API key.

### Option 3: Per-Order Callback

Pass `callbackUrl` in your order request:

```json
{
  "packageCode": "RB85_4D",
  "callbackUrl": "https://your-server.com/api/esim-callback"
}
```

This overrides the default webhook URL for that specific order.

## Webhook Events

### `esim.provisioned`

Sent when an eSIM QR code is ready after asynchronous provisioning.

**Payload:**
```json
{
  "event": "esim.provisioned",
  "timestamp": "2026-04-13T10:05:30.000Z",
  "data": {
    "order_reference": "order_1776079539762_hvkrk",
    "iccid": "8981100000012345678",
    "qr_code_url": "data:image/png;base64,iVBORw0KGgo...",
    "lpa_string": "LPA:1$rsp.example.com$ACTIVATION-CODE",
    "direct_apple_install_url": "https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=...",
    "direct_android_install_url": "https://android.esim.me?url=...",
    "package_name": "Japan 12 GB 4 Days"
  }
}
```

## Webhook Headers

Each webhook request includes these headers:

| Header | Description |
|--------|-------------|
| `X-Webhook-Event` | Event type (e.g., `esim.provisioned`) |
| `X-Webhook-Signature` | HMAC-SHA256 signature for verification |
| `X-Webhook-Timestamp` | ISO 8601 timestamp |
| `X-Webhook-Id` | Unique webhook delivery ID |
| `Content-Type` | `application/json` |
| `User-Agent` | `eSIMfly-Webhook/1.0` |

## Signature Verification

All webhooks are signed with HMAC-SHA256 using your `webhook_secret`. **Always verify the signature** to ensure the request is from eSIMfly.

### Node.js Example

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(body, signatureHeader, webhookSecret) {
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signatureHeader)
  );
}

// Express.js endpoint
app.post('/api/esim-callback', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const body = req.body.toString();

  if (!verifyWebhookSignature(body, signature, 'whsec_your_secret')) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(body);

  if (event.event === 'esim.provisioned') {
    const { order_reference, iccid, qr_code_url, lpa_string } = event.data;
    console.log(`eSIM ready! ICCID: ${iccid}`);

    // Deliver eSIM to your customer...
  }

  res.json({ received: true });
});
```

### Python Example

```python
import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = 'whsec_your_secret'

def verify_signature(payload, signature):
    expected = 'sha256=' + hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

@app.route('/api/esim-callback', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature', '')
    
    if not verify_signature(request.data, signature):
        return jsonify({'error': 'Invalid signature'}), 401
    
    event = request.json
    
    if event['event'] == 'esim.provisioned':
        data = event['data']
        print(f"eSIM ready! ICCID: {data['iccid']}")
        print(f"Order: {data['order_reference']}")
        # Deliver eSIM to your customer...
    
    return jsonify({'received': True})
```

## Retry Policy

If your server doesn't respond with a 2xx status code, we retry with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 10 seconds |
| 3 | 30 seconds |
| 4 | 2 minutes |
| 5 | 10 minutes |

After 5 failed attempts, the webhook is marked as `failed`. You can check delivery status via:

```
GET /api/v1/business/webhooks
```

The `recent_deliveries` field shows the last 10 webhook attempts with their status.

## View Webhook Settings

```
GET /api/v1/business/webhooks
```

**Response:**
```json
{
  "success": true,
  "webhook": {
    "url": "https://your-server.com/api/esim-callback",
    "events": ["esim.provisioned"],
    "api_key_name": "production-key"
  },
  "available_events": [
    { "event": "esim.provisioned", "description": "eSIM QR code is ready (KDDI and other async providers)" },
    { "event": "order.completed", "description": "Order fully processed with all details" }
  ],
  "recent_deliveries": [
    {
      "id": 1,
      "event": "esim.provisioned",
      "order_reference": "order_1776079539762_hvkrk",
      "status": "delivered",
      "attempts": 1,
      "last_attempt": "2026-04-13T10:05:31.000Z",
      "delivered_at": "2026-04-13T10:05:31.000Z"
    }
  ]
}
```

## Best Practices

1. **Always verify signatures** - Never trust a webhook without checking `X-Webhook-Signature`
2. **Respond quickly** - Return 200 within 10 seconds. Process the data asynchronously if needed
3. **Handle duplicates** - Use `X-Webhook-Id` or `order_reference` to deduplicate
4. **Use HTTPS** - Webhook URLs must use HTTPS in production
5. **Store your secret** - The `webhook_secret` is shown only once when first configured

## Fallback: Polling

If you can't receive webhooks, you can always poll the order status:

```
GET /api/v1/business/esims/order?orderReference=ORDER_REFERENCE
```

Poll every 15-30 seconds. When `esim.isPending` changes to `false` and `iccid` is populated, the eSIM is ready.

## Support

For webhook-related issues:
- **Email**: support@esimfly.net
- **Test endpoint**: `https://dev.esimfly.net/api/v1/business/webhooks/test-receiver`
