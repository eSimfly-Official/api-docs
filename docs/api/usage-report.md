---
sidebar_position: 10
title: Usage Report
---

import LlmPrompt from '@site/src/components/LlmPrompt';

# Usage Report

Get a **daily data-usage report** for one of your eSIMs over a period (7, 14, or 30 days): total and average usage, a day-by-day breakdown, and a breakdown by country and operator. Useful for showing customers where and how much data they've used.

## Endpoint

```
POST /api/v1/business/esims/usage-report
```

<LlmPrompt id="usage-report" />

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
| iccid | String | Yes* | The ICCID of the eSIM |
| esimId | Integer | Yes* | The eSIM `id` (from the eSIM list/order response). Used if `iccid` is not provided. |
| days | Integer | No | Reporting window in days (default `7`, max `90`). Typical values: `7`, `14`, `30`. |

\* Provide **either** `iccid` or `esimId`.

```json
{
  "iccid": "8948010010036785060",
  "days": 7
}
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Usage report retrieved",
  "data": {
    "iccid": "8948010010036785060",
    "period_days": 7,
    "start_date": "2026-06-21T00:00:00.000Z",
    "end_date": "2026-06-27T00:00:00.000Z",
    "summary": {
      "total_data_mb": 1260,
      "total_data_gb": 1.23,
      "avg_daily_mb": 1260,
      "avg_daily_gb": 1.23
    },
    "daily_usage": [
      { "date": "2026-06-27", "data_mb": 1260, "data_gb": 1.23 }
    ],
    "by_country": [
      {
        "country": "Turkey",
        "mcc": "286",
        "data_mb": 1260,
        "data_gb": 1.23,
        "operators": [
          { "operator": "Turkcell", "mnc": "01", "data_mb": 1260, "data_gb": 1.23 }
        ]
      }
    ]
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | Boolean | Whether the report was retrieved |
| data.iccid | String | The ICCID of the eSIM |
| data.period_days | Integer | The reporting window used |
| data.start_date / data.end_date | String | The report period (ISO 8601) |
| data.summary.total_data_mb / total_data_gb | Number | Total data used in the period |
| data.summary.avg_daily_mb / avg_daily_gb | Number | Average per day with usage |
| data.daily_usage | Array | Per-day usage, newest first |
| data.daily_usage[].date | String | Day (`YYYY-MM-DD`) |
| data.daily_usage[].data_mb / data_gb | Number | Data used that day |
| data.by_country | Array | Usage grouped by country |
| data.by_country[].country | String | Country name |
| data.by_country[].mcc | String | Mobile Country Code |
| data.by_country[].data_mb / data_gb | Number | Data used in that country |
| data.by_country[].operators | Array | Per-operator breakdown within the country |
| data.by_country[].operators[].operator | String | Operator name |
| data.by_country[].operators[].mnc | String | Mobile Network Code |
| data.by_country[].operators[].data_mb / data_gb | Number | Data used on that operator |

### Error Responses

#### 400 Bad Request

```json
{ "success": false, "message": "Provide either iccid or esimId", "code": "MISSING_IDENTIFIER" }
```

Not supported for this eSIM:
```json
{ "success": false, "message": "Usage reports are not available for this eSIM", "code": "NOT_SUPPORTED" }
```

#### 403 Forbidden

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

async function getUsageReport(iccid, days = 7) {
  const accessCode = 'esf_your_access_code';
  const secretKey = 'sk_your_secret_key';

  const body = JSON.stringify({ iccid, days });
  const timestamp = Date.now().toString();
  const requestId = uuidv4();
  const signData = timestamp + requestId + accessCode + body;
  const signature = crypto.createHmac('sha256', secretKey)
    .update(signData)
    .digest('hex')
    .toUpperCase();

  const response = await fetch('https://esimfly.net/api/v1/business/esims/usage-report', {
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
    console.log(`${data.data.summary.total_data_gb} GB over ${data.data.period_days} days`);
  } else {
    console.error(`Usage report failed: ${data.message}`);
  }
  return data;
}
```

## Notes

- Reports cover the last `days` days (max **90**). Data is reported per UTC day.
- `avg_daily` is averaged over days that had usage, not the full window.
- If the eSIM has not connected yet, totals are `0` and the breakdowns are empty.
