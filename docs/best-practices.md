---
sidebar_position: 8
title: Best Practices
description: Production-ready integration guidelines, optimization tips, and security best practices for eSIMfly API
---

# Best Practices

Build robust, secure, and efficient integrations with the eSIMfly API by following these production-tested best practices.

## 🔐 Security

### 1. Protect Your Credentials

**Never expose credentials in client-side code**:

```javascript
// ❌ BAD - Never do this
const accessCode = 'your_access_code_here';
const secretKey = 'your_secret_key_here';

// ✅ GOOD - Use environment variables
const accessCode = process.env.ESIMFLY_ACCESS_CODE;
const secretKey = process.env.ESIMFLY_SECRET_KEY;
```

**Store credentials securely**:
- Use environment variables
- Never commit to version control
- Rotate keys regularly (every 90 days recommended)
- Use different keys for development/production

### 2. Always Verify Webhook Signatures

```javascript
function verifyWebhookSignature(payload, signature, secret) {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computed)
  );
}
```

### 3. Use HTTPS Only

All API requests must use HTTPS. HTTP requests will be rejected.

### 4. Implement Request Signing Correctly

```javascript
// Correct signature calculation
const payload = `${accessCode}${requestId}${timestamp}`;
const signature = crypto
  .createHmac('sha256', secretKey)
  .update(payload)
  .digest('hex');
```

## ⚡ Performance

### 1. Cache Package Data

Package lists don't change frequently. Cache them:

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

async function getPackages(country) {
  const cacheKey = `packages_${country}`;

  // Check cache first
  let packages = cache.get(cacheKey);

  if (!packages) {
    // Fetch from API
    const response = await esimflyApi.getPackages({ country });
    packages = response.data.packages;

    // Store in cache
    cache.set(cacheKey, packages);
  }

  return packages;
}
```

### 2. Batch Operations

Order multiple eSIMs in one request:

```javascript
// ✅ GOOD - Single request for multiple eSIMs
await createOrder({
  package_code: 'US-1GB-7D',
  quantity: 5
});

// ❌ BAD - Multiple requests
for (let i = 0; i < 5; i++) {
  await createOrder({
    package_code: 'US-1GB-7D',
    quantity: 1
  });
}
```

### 3. Use Webhooks Instead of Polling

```javascript
// ❌ BAD - Polling for order status
async function waitForOrder(orderId) {
  while (true) {
    const order = await getOrder(orderId);
    if (order.status === 'completed') break;
    await sleep(5000); // Wastes API calls
  }
}

// ✅ GOOD - Use webhooks
app.post('/webhooks/esimfly', (req, res) => {
  if (req.body.event === 'order.completed') {
    processOrder(req.body.data);
  }
  res.status(200).send('OK');
});
```

### 4. Implement Connection Pooling

```javascript
const axios = require('axios');
const https = require('https');

const apiClient = axios.create({
  baseURL: 'https://esimfly.net/api/v1/business',
  httpsAgent: new https.Agent({
    keepAlive: true,
    maxSockets: 50
  })
});
```

## 🔄 Reliability

### 1. Implement Exponential Backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }
}

// Usage
const balance = await retryWithBackoff(() =>
  esimflyApi.getBalance()
);
```

### 2. Handle Rate Limits Gracefully

```javascript
async function makeApiRequest(url, options) {
  const response = await fetch(url, options);

  if (response.status === 429) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    const waitMs = (resetTime * 1000) - Date.now();

    console.log(`Rate limited. Waiting ${waitMs}ms`);
    await sleep(waitMs);

    // Retry request
    return makeApiRequest(url, options);
  }

  return response.json();
}
```

### 3. Store Request IDs for Debugging

```javascript
const requestLog = new Map();

async function apiCall(endpoint, data) {
  const requestId = crypto.randomUUID();
  const timestamp = Date.now();

  // Log request
  requestLog.set(requestId, {
    endpoint,
    timestamp,
    data
  });

  try {
    const response = await esimflyApi.request({
      endpoint,
      data,
      headers: {
        'RT-RequestID': requestId,
        'RT-Timestamp': timestamp
      }
    });

    // Log success
    requestLog.get(requestId).status = 'success';
    return response;

  } catch (error) {
    // Log failure
    requestLog.get(requestId).status = 'failed';
    requestLog.get(requestId).error = error.message;
    throw error;
  }
}
```

### 4. Validate Responses

```javascript
function validateResponse(response) {
  if (!response) {
    throw new Error('Empty response from API');
  }

  if (!response.hasOwnProperty('success')) {
    throw new Error('Invalid response format');
  }

  if (!response.success && !response.error) {
    throw new Error('Error response missing error message');
  }

  return true;
}

// Usage
const response = await apiCall('/balance');
validateResponse(response);
```

## 💰 Cost Optimization

### 1. Check Balance Before Large Orders

```javascript
async function createOrderSafe(packageCode, quantity) {
  // Get package price
  const packages = await getPackages();
  const package = packages.find(p => p.package_code === packageCode);

  const totalCost = package.price * quantity;

  // Check balance
  const balance = await getBalance();

  if (balance.balance < totalCost) {
    throw new Error(
      `Insufficient balance. Need $${totalCost}, have $${balance.balance}`
    );
  }

  // Proceed with order
  return createOrder({ package_code: packageCode, quantity });
}
```

### 2. Implement Balance Alerts

```javascript
async function checkBalanceAndAlert(threshold = 50) {
  const balance = await getBalance();

  if (balance.balance < threshold) {
    await sendAlert({
      type: 'low_balance',
      message: `Balance is low: $${balance.balance}`,
      action: 'Top up your account'
    });
  }
}

// Run periodically
setInterval(checkBalanceAndAlert, 3600000); // Every hour
```

### 3. Monitor Usage Metrics

```javascript
const metrics = {
  ordersCreated: 0,
  totalSpent: 0,
  apiCalls: 0,
  errors: 0
};

function trackMetrics(operation, cost = 0) {
  metrics.apiCalls++;

  if (operation === 'order.created') {
    metrics.ordersCreated++;
    metrics.totalSpent += cost;
  }

  // Log daily
  if (metrics.apiCalls % 1000 === 0) {
    console.log('Daily metrics:', metrics);
  }
}
```

## 🎯 User Experience

### 1. Provide Clear Error Messages

```javascript
function getUserFriendlyError(apiError) {
  const errorMap = {
    'INSUFFICIENT_BALANCE': 'Your account balance is too low. Please add funds to continue.',
    'INVALID_PACKAGE_CODE': 'This eSIM package is currently unavailable. Please try another option.',
    'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
    'PROVIDER_ERROR': 'Temporary service issue. Please try again in a few minutes.',
    'ESIM_NOT_FOUND': 'eSIM not found. Please verify the details and try again.'
  };

  return errorMap[apiError.code] || 'An unexpected error occurred. Please contact support.';
}

// Usage
try {
  await createOrder(orderData);
} catch (error) {
  const userMessage = getUserFriendlyError(error);
  showNotification(userMessage);
}
```

### 2. Show Real-Time Status Updates

```javascript
// Use webhooks for instant updates
app.post('/webhooks/esimfly', (req, res) => {
  const event = req.body;

  // Send real-time update to user
  if (event.event === 'order.completed') {
    io.to(event.data.user_id).emit('order_ready', {
      orderId: event.data.order_id,
      qrCode: event.data.esims[0].qr_code
    });
  }

  res.status(200).send('OK');
});
```

### 3. Implement Progress Indicators

```javascript
async function purchaseEsim(packageCode, onProgress) {
  try {
    onProgress({ status: 'checking_balance', progress: 25 });
    await checkBalance();

    onProgress({ status: 'creating_order', progress: 50 });
    const order = await createOrder({ package_code: packageCode });

    onProgress({ status: 'processing', progress: 75 });
    // Wait for webhook or poll

    onProgress({ status: 'completed', progress: 100 });
    return order;

  } catch (error) {
    onProgress({ status: 'failed', error: error.message });
    throw error;
  }
}
```

## 📊 Monitoring & Logging

### 1. Comprehensive Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'api-errors.log', level: 'error' }),
    new winston.transports.File({ filename: 'api-combined.log' })
  ]
});

async function apiCallWithLogging(endpoint, data) {
  const requestId = crypto.randomUUID();

  logger.info('API Request', {
    requestId,
    endpoint,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await esimflyApi.call(endpoint, data);

    logger.info('API Success', {
      requestId,
      endpoint,
      status: 'success'
    });

    return response;

  } catch (error) {
    logger.error('API Error', {
      requestId,
      endpoint,
      error: error.message,
      code: error.code
    });

    throw error;
  }
}
```

### 2. Set Up Alerts

```javascript
async function monitorApiHealth() {
  const errorRate = metrics.errors / metrics.apiCalls;

  if (errorRate > 0.05) { // 5% error rate
    await sendAlert({
      severity: 'high',
      message: `API error rate is ${(errorRate * 100).toFixed(2)}%`,
      metric: metrics
    });
  }
}
```

### 3. Track Response Times

```javascript
async function trackResponseTime(fn) {
  const start = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - start;

    // Log slow requests
    if (duration > 5000) {
      logger.warn('Slow API request', { duration });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('API request failed', { duration, error });
    throw error;
  }
}
```

## 🧪 Testing

### 1. Test in Sandbox First

```javascript
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://esimfly.net/api/v1/business'
  : 'https://esimfly.net/api/v1/business'; // Use test funds

// Use test mode flag
const testMode = process.env.NODE_ENV !== 'production';
```

### 2. Mock API for Unit Tests

```javascript
// __mocks__/esimfly-api.js
const mockApi = {
  getBalance: jest.fn(() =>
    Promise.resolve({ success: true, data: { balance: 100 } })
  ),
  createOrder: jest.fn(() =>
    Promise.resolve({ success: true, data: { order_id: 'TEST-123' } })
  )
};

module.exports = mockApi;
```

### 3. Integration Tests

```javascript
describe('eSIMfly Integration', () => {
  test('should create order successfully', async () => {
    const order = await createOrder({
      package_code: 'US-1GB-7D',
      quantity: 1
    });

    expect(order.success).toBe(true);
    expect(order.data.order_id).toBeDefined();
  });

  test('should handle insufficient balance', async () => {
    // Set balance to $0 in test environment
    await expect(
      createOrder({ package_code: 'US-1GB-7D', quantity: 100 })
    ).rejects.toThrow('INSUFFICIENT_BALANCE');
  });
});
```

## 📱 Mobile App Considerations

### 1. Handle Network Changes

```javascript
// React Native example
import NetInfo from '@react-native-community/netinfo';

async function apiCallWithNetworkCheck(endpoint, data) {
  const networkState = await NetInfo.fetch();

  if (!networkState.isConnected) {
    throw new Error('No internet connection');
  }

  return esimflyApi.call(endpoint, data);
}
```

### 2. Implement Offline Queue

```javascript
const offlineQueue = [];

async function queueApiCall(endpoint, data) {
  try {
    return await esimflyApi.call(endpoint, data);
  } catch (error) {
    if (error.message === 'No internet connection') {
      offlineQueue.push({ endpoint, data });
      return { queued: true };
    }
    throw error;
  }
}

// Process queue when online
NetInfo.addEventListener(state => {
  if (state.isConnected && offlineQueue.length > 0) {
    processOfflineQueue();
  }
});
```

### 3. Optimize for Battery

```javascript
// Batch requests instead of frequent polling
import BackgroundFetch from 'react-native-background-fetch';

BackgroundFetch.configure({
  minimumFetchInterval: 15 // minutes
}, async () => {
  await syncEsimStatus();
  BackgroundFetch.finish();
});
```

## 🌍 Internationalization

### 1. Handle Multiple Currencies

```javascript
function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(price);
}

// Display local currency equivalent
async function getLocalPrice(usdPrice, targetCurrency) {
  const exchangeRate = await getExchangeRate('USD', targetCurrency);
  return usdPrice * exchangeRate;
}
```

### 2. Localize Error Messages

```javascript
const errorMessages = {
  en: {
    'INSUFFICIENT_BALANCE': 'Insufficient balance',
    'INVALID_PACKAGE': 'Package unavailable'
  },
  es: {
    'INSUFFICIENT_BALANCE': 'Saldo insuficiente',
    'INVALID_PACKAGE': 'Paquete no disponible'
  },
  fr: {
    'INSUFFICIENT_BALANCE': 'Solde insuffisant',
    'INVALID_PACKAGE': 'Package indisponible'
  }
};

function getLocalizedError(code, locale = 'en') {
  return errorMessages[locale][code] || errorMessages.en[code];
}
```

## 📈 Scalability

### 1. Use Queue System for High Volume

```javascript
const Queue = require('bull');

const orderQueue = new Queue('esim-orders', process.env.REDIS_URL);

// Add to queue
orderQueue.add({ packageCode: 'US-1GB-7D', userId: 123 });

// Process queue
orderQueue.process(async (job) => {
  const { packageCode, userId } = job.data;
  return await createOrder({ package_code: packageCode, user_id: userId });
});
```

### 2. Implement Circuit Breaker

```javascript
const CircuitBreaker = require('opossum');

const options = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
};

const breaker = new CircuitBreaker(esimflyApi.createOrder, options);

breaker.fallback(() => ({
  success: false,
  error: 'Service temporarily unavailable'
}));

// Use circuit breaker
const order = await breaker.fire({ package_code: 'US-1GB-7D' });
```

## 🔍 Compliance

### 1. Log for Audit Trail

```javascript
async function createOrderWithAudit(packageCode, userId) {
  const auditLog = {
    timestamp: new Date().toISOString(),
    userId,
    action: 'create_order',
    packageCode,
    ip: request.ip
  };

  try {
    const order = await createOrder({ package_code: packageCode });

    auditLog.status = 'success';
    auditLog.orderId = order.data.order_id;

  } catch (error) {
    auditLog.status = 'failed';
    auditLog.error = error.message;
    throw error;

  } finally {
    await saveAuditLog(auditLog);
  }
}
```

### 2. Data Privacy

```javascript
// Don't log sensitive data
function sanitizeLogData(data) {
  const sanitized = { ...data };

  // Remove sensitive fields
  delete sanitized.secretKey;
  delete sanitized.accessCode;

  // Mask email
  if (sanitized.email) {
    sanitized.email = sanitized.email.replace(
      /(.{2}).*(@.*)/,
      '$1***$2'
    );
  }

  return sanitized;
}

logger.info('API Request', sanitizeLogData(requestData));
```

## 📚 Documentation

### 1. Document Your Integration

Keep internal documentation of your eSIMfly integration:
- API endpoints used
- Error handling strategies
- Webhook implementations
- Testing procedures

### 2. Code Comments

```javascript
/**
 * Creates an eSIM order with retry logic and balance check
 *
 * @param {string} packageCode - eSIMfly package code
 * @param {number} quantity - Number of eSIMs to order
 * @param {string} userId - User ID for tracking
 * @returns {Promise<Order>} Order details
 * @throws {Error} If insufficient balance or API error
 */
async function createOrderWithRetry(packageCode, quantity, userId) {
  // Implementation...
}
```

## 🎓 Learn More

- [API Reference](/docs/api-reference)
- [Error Codes](/docs/error-codes)
- [Webhooks](/docs/webhooks)
- [Code Examples](/docs/examples)

## 💬 Need Help?

- **Email**: support@esimfly.net
- **Live Chat**: Business Dashboard
- **Documentation**: docs.esimfly.net
