---
sidebar_position: 2
title: Quick Start
---

# Quick Start

Get started with the eSIMfly Business API in just a few minutes.

## Create an Account

1. Sign up for a business account at [eSIMfly Business](https://esimfly.net/signup)
2. Complete account verification
3. Deposit funds for testing

## Get Your API Credentials

1. Log in to your [Business Dashboard](https://esimfly.net/business-dashboard)
2. Navigate to **Settings** → **API Keys**
3. Click **Create New API Key**
4. Save your credentials:
   - **Access Code**: `esf_your_access_code`
   - **Secret Key**: `sk_your_secret_key` (shown only once!)

## Make Your First API Call

Test your connection by checking your account balance:

### cURL

```bash
curl --location 'https://esimfly.net/api/v1/business/balance' \
--header 'RT-AccessCode: YOUR_ACCESS_CODE' \
--header 'RT-RequestID: 550e8400-e29b-41d4-a716-446655440000' \
--header 'RT-Timestamp: 1628670421000' \
--header 'RT-Signature: YOUR_CALCULATED_SIGNATURE'
```

### Node.js

```javascript
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Your credentials
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

// Make request
fetch('https://esimfly.net/api/v1/business/balance', {
  headers: {
    'RT-AccessCode': accessCode,
    'RT-RequestID': requestId,
    'RT-Timestamp': timestamp,
    'RT-Signature': signature
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Response

```json
{
  "success": true,
  "data": {
    "balance": 1500.00,
    "currency": "USD"
  }
}
```

## Next Steps

- [Learn about Authentication](/docs/api-authentication) - Understand HMAC signature generation
- [Explore API Endpoints](/docs/api/balance) - See all available operations
- [Set up Webhooks](/docs/webhooks) - Receive real-time notifications
- [View Code Examples](/docs/examples) - Integration examples in multiple languages

## Test Environment

- **Base URL**: `https://esimfly.net/api/v1/business`
- **Rate Limit**: 1000 requests per hour
- **Timeout**: 30 seconds per request

## Need Help?

- 📧 **Email**: support@esimfly.net
- 💬 **Live Chat**: Available in dashboard
- 📚 **API Test Tool**: [Test your connection](https://esimfly.net/business-dashboard/api-test)