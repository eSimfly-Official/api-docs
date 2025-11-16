---
sidebar_position: 7
title: Webhooks
description: Real-time event notifications via webhooks for order status, eSIM activation, and balance updates
---

# Webhooks

Webhooks allow you to receive real-time notifications when events happen in your eSIMfly account. Instead of polling the API, your application receives HTTP POST requests whenever relevant events occur.

## Overview

**Why Use Webhooks?**
- ⚡ **Real-time updates** - Get notified instantly when events happen
- 💰 **Save API calls** - No need to poll for status changes
- 🔄 **Automated workflows** - Trigger actions based on events
- 📊 **Better UX** - Update your users immediately

## Webhook Events

### Available Events

| Event Type | Description | Trigger |
|-----------|-------------|---------|
| `order.created` | New order created | Order placed successfully |
| `order.completed` | Order fulfilled | eSIM provisioned and ready |
| `order.failed` | Order failed | Payment or provisioning failed |
| `esim.activated` | eSIM activated | First data session started |
| `esim.expired` | eSIM expired | Plan validity ended |
| `balance.low` | Balance warning | Balance below threshold |
| `topup.completed` | Top-up successful | eSIM data topped up |
| `topup.failed` | Top-up failed | Top-up processing error |

## Setting Up Webhooks

### 1. Create Webhook Endpoint

Your endpoint must:
- Accept POST requests
- Respond within 5 seconds
- Return status 200 for success
- Be HTTPS (production only)

```javascript
// Express.js example
app.post('/webhooks/esimfly', express.json(), async (req, res) => {
  const event = req.body;

  // Verify signature (recommended)
  const signature = req.headers['x-esimfly-signature'];
  if (!verifySignature(event, signature)) {
    return res.status(401).send('Invalid signature');
  }

  // Process event
  console.log('Received event:', event.type);

  // Respond quickly
  res.status(200).send('OK');

  // Process event asynchronously
  processEvent(event);
});
```

### 2. Register Webhook URL

Configure webhooks in your Business Dashboard:

1. Go to **Settings** → **Webhooks**
2. Click **Add Webhook URL**
3. Enter your endpoint URL: `https://yourdomain.com/webhooks/esimfly`
4. Select events to subscribe
5. Save and copy your webhook secret

### 3. Verify Webhook Signature

Always verify webhook authenticity:

```javascript
const crypto = require('crypto');

function verifySignature(payload, receivedSignature, secret) {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(computedSignature)
  );
}
```

## Event Payloads

### order.created

```json
{
  "event": "order.created",
  "timestamp": "2025-01-16T10:30:00Z",
  "data": {
    "order_id": "ORD-123456",
    "order_reference": "REF-ABC-123",
    "package_code": "US-1GB-7D",
    "package_name": "USA 1GB - 7 Days",
    "quantity": 1,
    "amount": 5.50,
    "status": "processing"
  }
}
```

### order.completed

```json
{
  "event": "order.completed",
  "timestamp": "2025-01-16T10:30:15Z",
  "data": {
    "order_id": "ORD-123456",
    "order_reference": "REF-ABC-123",
    "esims": [
      {
        "iccid": "8901234567890123456",
        "qr_code": "LPA:1$...",
        "activation_code": "LPA:1$...",
        "status": "new"
      }
    ]
  }
}
```

### order.failed

```json
{
  "event": "order.failed",
  "timestamp": "2025-01-16T10:30:10Z",
  "data": {
    "order_id": "ORD-123456",
    "order_reference": "REF-ABC-123",
    "error_code": "PROVIDER_ERROR",
    "error_message": "Temporary provider issue",
    "can_retry": true
  }
}
```

### esim.activated

```json
{
  "event": "esim.activated",
  "timestamp": "2025-01-16T12:00:00Z",
  "data": {
    "iccid": "8901234567890123456",
    "package_name": "USA 1GB - 7 Days",
    "activated_at": "2025-01-16T12:00:00Z",
    "expires_at": "2025-01-23T12:00:00Z"
  }
}
```

### esim.expired

```json
{
  "event": "esim.expired",
  "timestamp": "2025-01-23T12:00:00Z",
  "data": {
    "iccid": "8901234567890123456",
    "package_name": "USA 1GB - 7 Days",
    "data_used": 0.85,
    "data_total": 1.00,
    "expired_at": "2025-01-23T12:00:00Z"
  }
}
```

### balance.low

```json
{
  "event": "balance.low",
  "timestamp": "2025-01-16T15:00:00Z",
  "data": {
    "current_balance": 15.50,
    "threshold": 20.00,
    "message": "Account balance is running low"
  }
}
```

### topup.completed

```json
{
  "event": "topup.completed",
  "timestamp": "2025-01-16T14:00:00Z",
  "data": {
    "iccid": "8901234567890123456",
    "package_code": "US-2GB-30D",
    "package_name": "USA 2GB - 30 Days",
    "amount": 8.00,
    "new_expiry": "2025-02-15T14:00:00Z"
  }
}
```

### topup.failed

```json
{
  "event": "topup.failed",
  "timestamp": "2025-01-16T14:00:05Z",
  "data": {
    "iccid": "8901234567890123456",
    "package_code": "US-2GB-30D",
    "error_code": "TOPUP_NOT_ALLOWED",
    "error_message": "eSIM has expired and cannot be topped up"
  }
}
```

## Webhook Headers

Every webhook request includes these headers:

```http
Content-Type: application/json
X-eSIMfly-Signature: 3f5b8c7a9e1d2f4b6c8a0e3d5f7b9c1a3e5d7f9b
X-eSIMfly-Event: order.completed
X-eSIMfly-Delivery-ID: uuid-v4-here
```

## Best Practices

### 1. Respond Quickly

Always return 200 immediately, process asynchronously:

```javascript
app.post('/webhooks/esimfly', async (req, res) => {
  const event = req.body;

  // Respond immediately
  res.status(200).send('OK');

  // Queue for async processing
  await jobQueue.add('process-webhook', event);
});
```

### 2. Handle Idempotency

Webhooks may be delivered multiple times. Use delivery ID to prevent duplicates:

```javascript
const processedDeliveries = new Set();

function processWebhook(event, deliveryId) {
  if (processedDeliveries.has(deliveryId)) {
    console.log('Duplicate webhook, skipping');
    return;
  }

  processedDeliveries.add(deliveryId);
  // Process event...
}
```

### 3. Implement Retry Logic

Your endpoint should be resilient:

```javascript
async function processEvent(event) {
  try {
    // Process event
    await updateOrderStatus(event.data);
  } catch (error) {
    // Log error for retry
    await errorQueue.add({
      event,
      error: error.message,
      timestamp: Date.now()
    });
  }
}
```

### 4. Secure Your Endpoint

**Always verify signatures**:

```javascript
function verifyWebhook(req) {
  const signature = req.headers['x-esimfly-signature'];
  const secret = process.env.ESIMFLY_WEBHOOK_SECRET;

  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hash)
  );
}
```

**Whitelist eSIMfly IPs** (optional):
```
52.89.214.238
34.212.75.30
54.218.53.128
52.32.178.7
```

### 5. Monitor Webhook Health

Track webhook delivery success:

```javascript
const metrics = {
  received: 0,
  processed: 0,
  failed: 0,
  avgProcessTime: 0
};

app.post('/webhooks/esimfly', async (req, res) => {
  const start = Date.now();
  metrics.received++;

  try {
    await processWebhook(req.body);
    metrics.processed++;
  } catch (error) {
    metrics.failed++;
  }

  metrics.avgProcessTime = (
    (metrics.avgProcessTime * (metrics.received - 1) + (Date.now() - start))
    / metrics.received
  );

  res.status(200).send('OK');
});
```

## Webhook Retry Policy

If your endpoint fails, eSIMfly retries with exponential backoff:

| Attempt | Delay | Total Wait |
|---------|-------|------------|
| 1 | Immediate | 0s |
| 2 | 5 seconds | 5s |
| 3 | 30 seconds | 35s |
| 4 | 2 minutes | 2m 35s |
| 5 | 10 minutes | 12m 35s |
| 6 | 1 hour | 1h 12m 35s |

After 6 failed attempts, the webhook is marked as failed and you'll receive an email notification.

## Testing Webhooks

### Local Testing with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start your local server
node server.js

# Create tunnel
ngrok http 3000

# Use ngrok URL in webhook settings
# https://abc123.ngrok.io/webhooks/esimfly
```

### Manual Testing

Trigger test webhooks from dashboard:

1. Go to **Settings** → **Webhooks**
2. Click **Test** next to your webhook
3. Select event type to simulate
4. View delivery logs

### Test Payload

Send manual test with cURL:

```bash
curl -X POST https://yourdomain.com/webhooks/esimfly \
  -H "Content-Type: application/json" \
  -H "X-eSIMfly-Signature: test_signature" \
  -H "X-eSIMfly-Event: order.completed" \
  -d '{
    "event": "order.completed",
    "timestamp": "2025-01-16T10:30:00Z",
    "data": {
      "order_id": "TEST-123",
      "order_reference": "TEST-REF-123"
    }
  }'
```

## Common Issues

### Webhook Not Received

**Possible Causes**:
- Firewall blocking eSIMfly IPs
- SSL certificate issues (HTTPS required)
- Endpoint returning error status
- Response timeout (> 5 seconds)

**Solutions**:
1. Check webhook logs in dashboard
2. Verify endpoint is accessible publicly
3. Test with ngrok locally
4. Check server logs for errors

### Duplicate Webhooks

**Normal behavior** - Implement idempotency using delivery ID

### Delayed Webhooks

**Rare** - Usually delivered within 1 second
- Check retry logs in dashboard
- Verify your endpoint responds quickly
- Monitor webhook health metrics

## Webhook Logs

View webhook delivery history in dashboard:

- **Delivery Status**: Success/Failed
- **Response Time**: How long your endpoint took
- **Response Code**: HTTP status returned
- **Payload**: Full event data sent
- **Retries**: Number of retry attempts

## Example Implementations

### Node.js + Express

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.ESIMFLY_WEBHOOK_SECRET;

app.post('/webhooks/esimfly', async (req, res) => {
  // Verify signature
  const signature = req.headers['x-esimfly-signature'];
  const isValid = verifySignature(req.body, signature, WEBHOOK_SECRET);

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const event = req.body;
  console.log('Event received:', event.event);

  // Respond immediately
  res.status(200).send('OK');

  // Process asynchronously
  switch (event.event) {
    case 'order.completed':
      await handleOrderCompleted(event.data);
      break;
    case 'esim.activated':
      await handleEsimActivated(event.data);
      break;
    // Handle other events...
  }
});

function verifySignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hash)
  );
}

app.listen(3000);
```

### Python + Flask

```python
from flask import Flask, request
import hashlib
import hmac
import json

app = Flask(__name__)
WEBHOOK_SECRET = 'your_webhook_secret'

@app.route('/webhooks/esimfly', methods=['POST'])
def webhook():
    # Verify signature
    signature = request.headers.get('X-eSIMfly-Signature')
    payload = request.get_json()

    if not verify_signature(payload, signature):
        return 'Invalid signature', 401

    event = payload.get('event')
    print(f'Event received: {event}')

    # Respond immediately
    # Process event asynchronously using queue

    return 'OK', 200

def verify_signature(payload, signature):
    computed = hmac.new(
        WEBHOOK_SECRET.encode(),
        json.dumps(payload).encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, computed)

if __name__ == '__main__':
    app.run(port=3000)
```

### PHP

```php
<?php
$webhookSecret = getenv('ESIMFLY_WEBHOOK_SECRET');

// Get webhook payload
$payload = file_get_contents('php://input');
$event = json_decode($payload, true);

// Verify signature
$signature = $_SERVER['HTTP_X_ESIMFLY_SIGNATURE'];
$computed = hash_hmac('sha256', $payload, $webhookSecret);

if (!hash_equals($signature, $computed)) {
    http_response_code(401);
    exit('Invalid signature');
}

// Respond immediately
http_response_code(200);
echo 'OK';

// Process event asynchronously
// Queue job or use background worker

switch ($event['event']) {
    case 'order.completed':
        handleOrderCompleted($event['data']);
        break;
    case 'esim.activated':
        handleEsimActivated($event['data']);
        break;
}
?>
```

## Support

Need help with webhooks?

- **Documentation**: [docs.esimfly.net](https://docs.esimfly.net)
- **Email**: support@esimfly.net
- **Live Chat**: Business Dashboard
- **Test Tool**: Webhook tester in dashboard

## Related Documentation

- [API Authentication](/docs/api-authentication)
- [Error Handling](/docs/error-codes)
- [Best Practices](/docs/best-practices)
