# Security Policy

## 🔒 Reporting Security Vulnerabilities

The security of the eSIMfly API and its documentation is a top priority. We appreciate the security research community's efforts in helping us maintain a secure platform.

### How to Report

**DO NOT** open public GitHub issues for security vulnerabilities.

Instead, please report security issues privately to:

**Email**: security@esimfly.net

**Include in your report:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information for follow-up

### Response Timeline

- **Initial response**: Within 24 hours
- **Status update**: Within 72 hours
- **Fix timeline**: Depends on severity (see below)

### Severity Levels

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | Immediate threat to API security, data breach possible | 24-48 hours |
| **High** | Significant security risk, requires urgent attention | 3-7 days |
| **Medium** | Security issue with limited impact | 7-14 days |
| **Low** | Minor security concern or best practice issue | 14-30 days |

## 🛡️ Security Best Practices for API Users

### Authentication Security

**DO:**
- ✅ Store API keys in environment variables
- ✅ Use HTTPS for all API requests
- ✅ Rotate API keys every 90 days
- ✅ Implement request signing correctly
- ✅ Verify webhook signatures

**DON'T:**
- ❌ Hardcode API keys in source code
- ❌ Commit secrets to version control
- ❌ Share API keys via email or chat
- ❌ Use the same keys across environments
- ❌ Log API keys or signatures

### Example: Secure Credential Storage

```javascript
// ❌ NEVER DO THIS
const API_KEY = 'rt_live_1234567890abcdef';

// ✅ DO THIS
const API_KEY = process.env.ESIMFLY_API_KEY;

// ✅ EVEN BETTER - Use secrets management
const API_KEY = await secretsManager.getSecret('esimfly-api-key');
```

### Rate Limiting

Implement rate limiting on your end to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many API requests, please try again later'
});

app.use('/api/', apiLimiter);
```

### Input Validation

Always validate input before making API calls:

```javascript
function validateOrderRequest(data) {
  // Validate package code format
  if (!/^[A-Z]{2}-\d+[GM]B-\d+D$/.test(data.package_code)) {
    throw new Error('Invalid package code format');
  }

  // Validate quantity
  if (!Number.isInteger(data.quantity) || data.quantity < 1) {
    throw new Error('Invalid quantity');
  }

  return true;
}
```

### Webhook Security

**Verify all webhook requests:**

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

app.post('/webhooks/esimfly', (req, res) => {
  const signature = req.headers['x-esimfly-signature'];

  if (!verifyWebhook(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook...
});
```

### Data Privacy

**Personal Data Handling:**
- Only request necessary data
- Don't log sensitive information
- Encrypt data at rest and in transit
- Follow GDPR/privacy regulations
- Implement data retention policies

**Example: Sanitize logs**

```javascript
function sanitizeLogs(data) {
  const sanitized = { ...data };

  // Remove sensitive fields
  delete sanitized.api_key;
  delete sanitized.secret;

  // Mask personal data
  if (sanitized.email) {
    sanitized.email = sanitized.email.replace(
      /(.{2}).*(@.*)/,
      '$1***$2'
    );
  }

  if (sanitized.iccid) {
    sanitized.iccid = `***${sanitized.iccid.slice(-4)}`;
  }

  return sanitized;
}

logger.info('API Request', sanitizeLogs(requestData));
```

## 🔐 API Security Features

### HMAC-SHA256 Signature

All API requests require signature verification:

```
Signature = HMAC-SHA256(AccessCode + RequestID + Timestamp, SecretKey)
```

This ensures:
- Request authenticity
- Message integrity
- Replay attack prevention

### Timestamp Validation

Requests are only valid for 5 minutes:
- Prevents replay attacks
- Mitigates man-in-the-middle risks

### Unique Request IDs

UUID v4 required for each request:
- Prevents duplicate processing
- Enables request tracking
- Detects replay attempts

## 🚨 Common Security Mistakes

### Mistake 1: Exposing Keys in Client-Side Code

```javascript
// ❌ WRONG - Keys visible in browser
const apiKey = 'rt_live_abc123';
fetch('/api/order', {
  headers: { 'Authorization': apiKey }
});

// ✅ CORRECT - Proxy through your backend
fetch('/api/create-order', {
  method: 'POST',
  body: JSON.stringify(orderData)
});
```

### Mistake 2: Not Validating Webhook Signatures

```javascript
// ❌ WRONG - Trusts all webhook requests
app.post('/webhook', (req, res) => {
  processOrder(req.body);
});

// ✅ CORRECT - Verifies signature
app.post('/webhook', (req, res) => {
  if (!verifySignature(req.body, req.headers['x-signature'])) {
    return res.status(401).send('Unauthorized');
  }
  processOrder(req.body);
});
```

### Mistake 3: Logging Sensitive Data

```javascript
// ❌ WRONG
console.log('API Request:', {
  api_key: apiKey,
  secret: secret,
  user_email: email
});

// ✅ CORRECT
console.log('API Request:', {
  endpoint: '/order',
  request_id: requestId,
  timestamp: timestamp
});
```

## 🎯 Security Checklist

Before going to production, ensure:

- [ ] API keys stored in environment variables
- [ ] HTTPS enforced for all requests
- [ ] Webhook signatures verified
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] Error messages don't leak sensitive info
- [ ] Logging excludes secrets and PII
- [ ] API keys rotated regularly
- [ ] Monitoring and alerting configured
- [ ] Security headers configured

## 📋 Compliance

eSIMfly API complies with:
- **PCI DSS**: Payment card data security
- **GDPR**: EU data protection
- **SOC 2 Type II**: Security controls
- **ISO 27001**: Information security management

## 🔍 Regular Security Audits

We perform:
- **Penetration testing**: Quarterly
- **Code reviews**: Every release
- **Dependency scanning**: Continuous
- **Security training**: Ongoing

## 📞 Contact

- **Security issues**: security@esimfly.net
- **General support**: support@esimfly.net
- **Documentation**: docs.esimfly.net

## 🏆 Hall of Fame

We recognize security researchers who responsibly disclose vulnerabilities:

*Hall of Fame coming soon*

## 📜 Responsible Disclosure

We follow responsible disclosure principles:
1. Report sent to security@esimfly.net
2. We acknowledge within 24 hours
3. We investigate and develop fix
4. We deploy fix to production
5. We coordinate public disclosure (typically 90 days)
6. We credit researcher (with permission)

Thank you for helping keep eSIMfly secure! 🔒
