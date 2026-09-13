---
sidebar_position: 7
title: eSIM Status
---

import LlmPrompt from '@site/src/components/LlmPrompt';

# eSIM Status

Get the **live status** of one of your eSIMs — current status, the network it last connected to, device details, activation/usage timestamps, and data usage — pulled directly from the network in real time. The stored record is updated with the fresh values at the same time.

## Endpoint

```
POST /api/v1/business/esims/status
```

<LlmPrompt id="esim-status" />

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

Identify the eSIM by `iccid` (recommended) or `esimId`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| iccid | String | Yes* | The ICCID of the eSIM to query |
| esimId | Integer | Yes* | The eSIM `id` (from the eSIM list/order response). Used if `iccid` is not provided. |

\* Provide **either** `iccid` or `esimId`.

```json
{
  "iccid": "8948010010036785060"
}
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Live eSIM status retrieved",
  "data": {
    "iccid": "8948010010036785060",
    "status": "ACTIVE",
    "esim_status": "Active",
    "smdp_status": "AFFECTED",
    "profile": "Enabled",
    "unlimited": false,
    "last_network": {
      "operator": "Optus",
      "mcc": "505",
      "mnc": "2",
      "country": "Australia",
      "country_iso2": "AU",
      "connection_type": "4G - LTE"
    },
    "device": {
      "model": "GTF7P",
      "imei": "350000000000000"
    },
    "activation_date": "2026-06-26T14:34:40.000Z",
    "last_usage_date": "2026-06-26T14:35:21.000Z",
    "expiry_date": "2026-07-26T14:34:40.000Z",
    "data_usage": {
      "used_gb": 0,
      "total_gb": 1,
      "unlimited": false
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | Whether the live status was retrieved |
| message | String | Human-readable summary |
| data.iccid | String | The ICCID of the eSIM |
| data.status | String | Lifecycle status (e.g. `NEW`, `ACTIVE`, `EXPIRED`, `DEPLETED`) |
| data.esim_status | String | Installation/usage state: `New`, `Not Active`, `Active`, `Installed`, or `Assigned (Not Installed)` |
| data.smdp_status | String | SM-DP+ profile status |
| data.profile | String/null | eSIM profile installation state: `Enabled`, `Disabled`, or `Not Installed` |
| data.unlimited | Boolean | Whether the plan is unlimited |
| data.last_network | Object | The network the eSIM most recently connected to (null fields if it has not connected yet) |
| data.last_network.operator | String | Network operator name |
| data.last_network.mcc | String | Mobile Country Code |
| data.last_network.mnc | String | Mobile Network Code |
| data.last_network.country | String | Country of the last network |
| data.last_network.country_iso2 | String | ISO 3166-1 alpha-2 country code |
| data.last_network.connection_type | String | Radio access technology (e.g. `4G - LTE`, `5G`) |
| data.device | Object | The device the eSIM is installed on (null fields if not installed yet) |
| data.device.model | String | Device model |
| data.device.imei | String | Device IMEI |
| data.activation_date | String/null | When the eSIM was first activated (ISO 8601), or `null` if not activated |
| data.last_usage_date | String/null | Timestamp of the most recent usage (ISO 8601) |
| data.expiry_date | String/null | When the plan expires (ISO 8601) |
| data.data_usage | Object | Data usage summary |
| data.data_usage.used_gb | Number | Data used, in GB |
| data.data_usage.total_gb | Number/null | Plan allowance in GB (`null` for unlimited plans) |
| data.data_usage.unlimited | Boolean | Whether the plan is unlimited |

### Error Responses

#### 400 Bad Request

Missing identifier:
```json
{ "success": false, "message": "Provide either iccid or esimId", "code": "MISSING_IDENTIFIER" }
```

#### 403 Forbidden

eSIM does not belong to your account:
```json
{ "success": false, "message": "You do not have permission to access this eSIM", "code": "FORBIDDEN" }
```

#### 404 Not Found

```json
{ "success": false, "message": "eSIM not found", "code": "ESIM_NOT_FOUND" }
```

#### 502 Bad Gateway

The network could not be reached:
```json
{ "success": false, "message": "Failed to fetch live status from the provider", "code": "PROVIDER_ERROR" }
```

## Example

```javascript
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

async function getEsimStatus(iccid) {
  const accessCode = 'esf_your_access_code';
  const secretKey = 'sk_your_secret_key';

  const body = JSON.stringify({ iccid });
  const timestamp = Date.now().toString();
  const requestId = uuidv4();
  const signData = timestamp + requestId + accessCode + body;
  const signature = crypto.createHmac('sha256', secretKey)
    .update(signData)
    .digest('hex')
    .toUpperCase();

  const response = await fetch('https://esimfly.net/api/v1/business/esims/status', {
    method: 'POST',
    headers: {
      'RT-AccessCode': accessCode,
      'RT-RequestID': requestId,
      'RT-Timestamp': timestamp,
      'RT-Signature': signature,
      'Content-Type': 'application/json'
    },
    body
  });

  const data = await response.json();
  if (data.success) {
    const d = data.data;
    console.log(`${d.status} on ${d.last_network.operator || 'no network'} — ${d.data_usage.used_gb} GB used`);
  } else {
    console.error(`Status lookup failed: ${data.message}`);
  }
  return data;
}
```

## Notes

- Status is fetched **live** from the network on every call, so it always reflects the current state.
- `last_network`, `device`, and `activation_date` are populated only once the eSIM has been installed and has connected to a network — they are `null` beforehand.
- For unlimited plans, `data_usage.total_gb` is `null` and validity is governed by `expiry_date`.
