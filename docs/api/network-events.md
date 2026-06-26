---
sidebar_position: 8
title: Network Events
---

# Network Events

List the recent **network events** for one of your eSIMs — each time it attached to a network or opened a data session, including when, where, which network it used, the connection type, and whether that network is covered by the plan. Useful for diagnosing "no data" reports and confirming a device is connecting to an allowed network.

Events cover up to the **last 7 days** and are returned newest-first. Available for eSIMs on networks that report event data.

## Endpoint

```
POST /api/v1/business/esims/network-events
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
  "message": "Network events retrieved",
  "data": {
    "iccid": "8948010010036785060",
    "total_events": 2,
    "wrong_network_count": 0,
    "events": [
      {
        "time": "2026-06-26T14:08:51",
        "event_type": "data_session",
        "req_type": "Update",
        "operator": "Telenor",
        "mcc": "240",
        "mnc": "07",
        "country": "Sweden",
        "country_iso2": "SE",
        "msisdn": "48000000000",
        "apn": "plus",
        "connection_type": "4G - LTE",
        "data_response": "9700: Success 100.00 Mb",
        "is_allowed": true
      },
      {
        "time": "2026-06-26T13:08:49",
        "event_type": "attach",
        "req_type": "ULR",
        "operator": "Telenor",
        "mcc": "240",
        "mnc": "07",
        "country": "Sweden",
        "country_iso2": "SE",
        "msisdn": null,
        "apn": null,
        "connection_type": null,
        "data_response": null,
        "is_allowed": true
      }
    ]
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | Whether the events were retrieved |
| message | String | Human-readable summary |
| data.iccid | String | The ICCID of the eSIM |
| data.total_events | Integer | Number of events returned |
| data.wrong_network_count | Integer | How many events were on a network **not** covered by the plan |
| data.events | Array | The network events, newest first |
| data.events[].time | String | When the event occurred (ISO 8601, UTC) |
| data.events[].event_type | String | High-level category: `attach`, `data_session`, `location_update`, or the raw type |
| data.events[].req_type | String | Specific request type, e.g. `Init`, `Update`, `Term` (data session) or `UL`, `ULR` (attach) |
| data.events[].operator | String | Network operator the eSIM connected to |
| data.events[].mcc | String | Mobile Country Code |
| data.events[].mnc | String | Mobile Network Code |
| data.events[].country | String | Country of the network |
| data.events[].country_iso2 | String | ISO 3166-1 alpha-2 country code |
| data.events[].msisdn | String/null | The eSIM's phone number on the network (present on data-session events) |
| data.events[].apn | String/null | Access Point Name used for the data session |
| data.events[].connection_type | String/null | Radio access technology (e.g. `4G - LTE`, `5G`) |
| data.events[].data_response | String/null | Network response for the data session, including data passed (e.g. `9700: Success 100.00 Mb`) |
| data.events[].is_allowed | Boolean | Whether this network is covered by the plan (`false` = wrong network) |

### Error Responses

#### 400 Bad Request

Missing identifier:
```json
{ "success": false, "message": "Provide either iccid or esimId", "code": "MISSING_IDENTIFIER" }
```

Not supported for this eSIM:
```json
{ "success": false, "message": "Network events are not available for this eSIM", "code": "NOT_SUPPORTED" }
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

## Example

```javascript
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

async function getNetworkEvents(iccid) {
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

  const response = await fetch('https://esimfly.net/api/v1/business/esims/network-events', {
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
    console.log(`${data.data.total_events} events, ${data.data.wrong_network_count} on a wrong network`);
  } else {
    console.error(`Lookup failed: ${data.message}`);
  }
  return data;
}
```

## Notes

- Events cover up to the **last 7 days**. If the eSIM has not connected yet, the list is empty.
- A non-empty `wrong_network_count` means the device latched onto a network outside the plan's coverage — usually the cause of a "connected but no data" report. Toggling airplane mode (or manually selecting an allowed network) typically resolves it.
- `is_allowed` is evaluated against every plan currently on the eSIM, including any added later.
