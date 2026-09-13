---
sidebar_position: 9
title: Webhooks
---

import LlmPrompt from '@site/src/components/LlmPrompt';

# Webhooks

Receive a signed HTTP POST the moment something changes on one of your eSIMs — the profile
is installed on a phone, the plan becomes active or expires, the customer is running out of data —
instead of polling.

<LlmPrompt id="webhooks" />

## Events

| Event | When it fires | Latency | Availability |
|---|---|---|---|
| `esim.installed` | The profile is enabled on a device for the first time | seconds | eSIMfly-network eSIMs |
| `esim.profile.updated` | SM-DP+ profile state changes: `BPP installation` (download started) → `Enable` → `Disable` / `Delete` | seconds | eSIMfly-network eSIMs |
| `esim.usage.threshold` | Remaining data crosses **500 / 200 / 100 / 50 MB** | seconds | eSIMfly-network eSIMs (not unlimited plans) |
| `esim.status.changed` | Lifecycle status changes: `NEW` → `ACTIVE` → `DEPLETED` / `EXPIRED` / `CANCELLED` | up to 30 min (immediate after a manual refresh or `POST /esims/status`) | all providers |
| `esim.provisioned` | An asynchronously provisioned order has its QR code ready | seconds | async packages only |
| `order.completed` | Reserved — not emitted yet | — | — |

"eSIMfly-network eSIMs" are packages that expose `countries` / `networks` in
[Get All Packages](/docs/api/packages). Their profile and usage events come straight from the
network in real time; other providers are polled, so they only receive `esim.status.changed`.

Each event for one eSIM is sent **once** per transition, even when we learn about it from two sources.

## Setup

### Via API

```
PUT /api/v1/business/webhooks
```

```json
{
  "webhook_url": "https://your-server.com/api/esimfly-webhook",
  "events": ["esim.installed", "esim.status.changed", "esim.usage.threshold"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook settings updated",
  "webhook": {
    "url": "https://your-server.com/api/esimfly-webhook",
    "secret": "whsec_a1b2c3d4e5...",
    "events": ["esim.installed", "esim.status.changed", "esim.usage.threshold"]
  },
  "note": "Save your webhook_secret - it is used to verify webhook signatures via X-Webhook-Signature header."
}
```

The `secret` is shown **once**. Store it in your secret manager.

### Via Dashboard

**Business Dashboard → Settings → API Keys → Set URL** on the key you use for the API.

### View settings and recent deliveries

```
GET /api/v1/business/webhooks
```

```json
{
  "success": true,
  "webhook": { "url": "https://your-server.com/api/esimfly-webhook", "events": ["esim.installed"], "api_key_name": "production-key" },
  "available_events": [
    { "event": "esim.installed", "description": "Profile installed and enabled on a device for the first time" },
    { "event": "esim.profile.updated", "description": "SM-DP+ profile state changed (BPP installation / Enable / Disable / Delete)" },
    { "event": "esim.status.changed", "description": "Lifecycle status changed (NEW, ACTIVE, DEPLETED, EXPIRED, ...)" },
    { "event": "esim.usage.threshold", "description": "Remaining data crossed a threshold (500 / 200 / 100 / 50 MB)" },
    { "event": "esim.provisioned", "description": "eSIM QR code is ready (asynchronously provisioned packages)" },
    { "event": "order.completed", "description": "Order fully processed with all details" }
  ],
  "recent_deliveries": [
    { "id": 1, "event": "esim.installed", "order_reference": "order_1776079539762_hvkrk", "status": "delivered", "attempts": 1, "last_attempt": "2026-09-13T10:05:31.000Z", "delivered_at": "2026-09-13T10:05:31.000Z" }
  ]
}
```

## Delivery

Every delivery is a `POST` to your URL with these headers:

| Header | Description |
|--------|-------------|
| `X-Webhook-Event` | Event name, e.g. `esim.usage.threshold` |
| `X-Webhook-Signature` | `sha256=<hex HMAC-SHA256 of the raw body, keyed with your webhook secret>` |
| `X-Webhook-Timestamp` | ISO 8601 time the event was created |
| `X-Webhook-Id` | Unique delivery id — use it to deduplicate |
| `Content-Type` | `application/json` |
| `User-Agent` | `eSIMfly-Webhook/1.0` |

Body shape is the same for every event:

```json
{
  "event": "esim.usage.threshold",
  "timestamp": "2026-09-13T15:05:20.391Z",
  "data": {
    "iccid": "8948010010092445039",
    "esim_id": 23691,
    "package_code": "2163597",
    "order_reference": "order_1755559183090_vyf9w",
    "source": "usage_threshold",
    "...": "event-specific fields below"
  }
}
```

`data.iccid`, `data.esim_id`, `data.package_code` and `data.order_reference` are present on every eSIM event.

### Event payloads

**`esim.installed`**
```json
{ "eid": "89049032020008884800235164256791", "imsi": "260010166196940", "installed_at": "2026-09-13T15:20:23.576Z" }
```

**`esim.profile.updated`**
```json
{
  "profile_status": "Enable",
  "profile": "Enabled",
  "previous_profile_status": "BPP installation",
  "eid": "89049032020008884800235164256791",
  "imsi": "260010166196940",
  "changed_at": "2026-09-13T15:20:23.576Z"
}
```
`profile_status` is the raw network value (`BPP installation`, `Enable`, `Disable`, `Delete`); `profile` is the
friendly label used by [eSIM Status](/docs/api/esim-status) (`Enabled`, `Disabled`, `Not Installed`).

**`esim.status.changed`**
```json
{ "old_status": "NEW", "new_status": "ACTIVE", "changed_at": "2026-09-13T15:30:00.000Z", "expiry_date": "2026-10-13T15:30:00.000Z" }
```

**`esim.usage.threshold`**
```json
{
  "threshold_remaining_mb": 100,
  "used_percent": 98,
  "used_gb": 4.9,
  "total_gb": 5,
  "remaining_gb": 0.1,
  "package_id": 213328290,
  "reported_at": "2026-09-13T15:05:20.391Z"
}
```
Thresholds are fixed at 500, 200, 100 and 50 MB remaining; each fires once per package.

**`esim.provisioned`**
```json
{ "iccid": "8981100000012345678", "qr_code_url": "data:image/png;base64,...", "lpa_string": "LPA:1$...", "direct_apple_install_url": "https://esimsetup.apple.com/...", "direct_android_install_url": "https://...", "package_name": "..." }
```

## Signature verification

Always verify before trusting a delivery. Compute the HMAC over the **raw** request body.

### Node.js

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(rawBody, signatureHeader, webhookSecret) {
  const expected = 'sha256=' + crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Express.js - keep the body raw on this route
app.post('/api/esimfly-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const rawBody = req.body.toString();
  if (!verifyWebhookSignature(rawBody, req.headers['x-webhook-signature'], process.env.ESIMFLY_WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  const deliveryId = req.headers['x-webhook-id'];
  if (await alreadyProcessed(deliveryId)) return res.json({ received: true });

  const { event, data } = JSON.parse(rawBody);
  await queue.add({ deliveryId, event, data });   // process asynchronously
  res.json({ received: true });                    // respond within 10 seconds
});
```

### Python

```python
import hmac, hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = 'whsec_your_secret'

def verify_signature(raw_body: bytes, signature: str) -> bool:
    expected = 'sha256=' + hmac.new(WEBHOOK_SECRET.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature or '')

@app.route('/api/esimfly-webhook', methods=['POST'])
def webhook():
    if not verify_signature(request.get_data(), request.headers.get('X-Webhook-Signature')):
        return jsonify({'error': 'Invalid signature'}), 401
    event = request.get_json()
    # enqueue event['event'], event['data'] and return quickly
    return jsonify({'received': True})
```

## Retry policy

We expect a `2xx` within **10 seconds**. Otherwise we retry:

| Attempt | Delay after previous |
|---------|----------------------|
| 1 | immediate |
| 2 | 10 seconds |
| 3 | 30 seconds |
| 4 | 2 minutes |
| 5 | 10 minutes |

After 5 failed attempts the delivery is marked `failed` and shows as such in `recent_deliveries`.

## Best practices

1. **Verify the signature** on the raw body — never on a re-serialised JSON object.
2. **Deduplicate** on `X-Webhook-Id`; retries and multi-source detection can both resend.
3. **Respond fast, work later** — persist the payload, return `200`, process in a job.
4. **Subscribe to what you use.** `esim.profile.updated` is the chattiest event (every download / enable / disable); most integrations only need `esim.installed`, `esim.status.changed` and `esim.usage.threshold`.
5. **Keep your local eSIM record as the source of truth** and apply events to it; use [Query eSIM Usage](/docs/api/esims-usage) or [eSIM Status](/docs/api/esim-status) only to reconcile.
6. **HTTPS only.** Rotate the secret by calling `PUT /webhooks` again.

## Support

- **Email**: support@esimfly.net
