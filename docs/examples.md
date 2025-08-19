---
sidebar_position: 4
title: Code Examples
---

# Code Examples

Complete code examples for integrating with the eSIMfly Business API.

## Node.js / JavaScript

### Installation

```bash
npm install axios crypto uuid
```

### Complete Integration Example

```javascript
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class ESIMflyAPI {
  constructor(accessCode, secretKey, useHMAC = true) {
    this.accessCode = accessCode;
    this.secretKey = secretKey;
    this.useHMAC = useHMAC;
    this.baseURL = 'https://esimfly.net/api/v1/business';
  }

  // Generate HMAC headers
  generateHMACHeaders(body = '') {
    const timestamp = Date.now().toString();
    const requestId = uuidv4();
    
    const signData = timestamp + requestId + this.accessCode + body;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(signData)
      .digest('hex')
      .toUpperCase();
    
    return {
      'RT-AccessCode': this.accessCode,
      'RT-RequestID': requestId,
      'RT-Timestamp': timestamp,
      'RT-Signature': signature
    };
  }

  // Make API request
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const body = data ? JSON.stringify(data) : '';
    
    let headers = {
      'Content-Type': 'application/json'
    };

    if (this.useHMAC) {
      headers = { ...headers, ...this.generateHMACHeaders(body) };
    } else {
      headers['RT-AccessCode'] = this.accessCode;
    }

    try {
      const response = await axios({
        method,
        url,
        headers,
        data: data
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.data.error || error.response.statusText}`);
      }
      throw error;
    }
  }

  // Get account balance
  async getBalance() {
    return this.request('GET', '/balance');
  }

  // Order eSIM
  async orderESIM(packageCode, packageName, price, quantity = 1) {
    return this.request('POST', '/esims/order', {
      packageCode,
      packageName,
      price,
      quantity
    });
  }

  // Get order status
  async getOrderStatus(orderReference) {
    return this.request('GET', `/esims/order?orderReference=${orderReference}`);
  }

  // List eSIMs
  async listESIMs(page = 1, limit = 20, status = null) {
    let endpoint = `/esims?page=${page}&limit=${limit}`;
    if (status) endpoint += `&status=${status}`;
    return this.request('GET', endpoint);
  }

  // Get eSIM details
  async getESIMDetails(esimId) {
    return this.request('GET', `/esims/${esimId}`);
  }

  // Top-up eSIM
  async topupESIM(esimId, packageCode, packageName, price) {
    return this.request('POST', `/esims/${esimId}/topup`, {
      packageCode,
      packageName,
      price
    });
  }
}

// Usage example
async function main() {
  const api = new ESIMflyAPI('esf_your_access_code', 'sk_your_secret_key');

  try {
    // Check balance
    const balance = await api.getBalance();
    console.log('Current balance:', balance.balance);

    // Order an eSIM
    const order = await api.orderESIM(
      'airalo_usa_1gb_7days',
      'USA 1GB - 7 Days',
      4.50
    );
    console.log('Order created:', order.orderReference);

    // Check order status
    const status = await api.getOrderStatus(order.orderReference);
    console.log('Order status:', status.order.status);

    // List all eSIMs
    const esims = await api.listESIMs();
    console.log('Total eSIMs:', esims.pagination.total);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Python

### Installation

```bash
pip install requests
```

### Complete Integration Example

```python
import hashlib
import hmac
import json
import time
import uuid
import requests


class ESIMflyAPI:
    def __init__(self, access_code, secret_key, use_hmac=True):
        self.access_code = access_code
        self.secret_key = secret_key
        self.use_hmac = use_hmac
        self.base_url = 'https://esimfly.net/api/v1/business'
    
    def generate_hmac_headers(self, body=''):
        """Generate HMAC authentication headers"""
        timestamp = str(int(time.time() * 1000))
        request_id = str(uuid.uuid4())
        
        # Concatenate signing data
        sign_data = timestamp + request_id + self.access_code + body
        
        # Calculate HMAC-SHA256
        signature = hmac.new(
            self.secret_key.encode('utf-8'),
            sign_data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest().upper()
        
        return {
            'RT-AccessCode': self.access_code,
            'RT-RequestID': request_id,
            'RT-Timestamp': timestamp,
            'RT-Signature': signature
        }
    
    def request(self, method, endpoint, data=None):
        """Make API request"""
        url = f"{self.base_url}{endpoint}"
        body = json.dumps(data) if data else ''
        
        headers = {'Content-Type': 'application/json'}
        
        if self.use_hmac:
            headers.update(self.generate_hmac_headers(body))
        else:
            headers['RT-AccessCode'] = self.access_code
        
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            data=body if data else None
        )
        
        if response.status_code >= 400:
            error_data = response.json()
            raise Exception(f"API Error: {error_data.get('error', 'Unknown error')}")
        
        return response.json()
    
    def get_balance(self):
        """Get account balance"""
        return self.request('GET', '/balance')
    
    def order_esim(self, package_code, package_name, price, quantity=1):
        """Order a new eSIM"""
        return self.request('POST', '/esims/order', {
            'packageCode': package_code,
            'packageName': package_name,
            'price': price,
            'quantity': quantity
        })
    
    def get_order_status(self, order_reference):
        """Get order status"""
        return self.request('GET', f'/esims/order?orderReference={order_reference}')
    
    def list_esims(self, page=1, limit=20, status=None):
        """List all eSIMs"""
        endpoint = f'/esims?page={page}&limit={limit}'
        if status:
            endpoint += f'&status={status}'
        return self.request('GET', endpoint)
    
    def get_esim_details(self, esim_id):
        """Get eSIM details"""
        return self.request('GET', f'/esims/{esim_id}')
    
    def topup_esim(self, esim_id, package_code, package_name, price):
        """Top-up an eSIM"""
        return self.request('POST', f'/esims/{esim_id}/topup', {
            'packageCode': package_code,
            'packageName': package_name,
            'price': price
        })


def main():
    # Initialize API client
    api = ESIMflyAPI('esf_your_access_code', 'sk_your_secret_key')
    
    try:
        # Check balance
        balance = api.get_balance()
        print(f"Current balance: ${balance['balance']}")
        
        # Order an eSIM
        order = api.order_esim(
            'airalo_usa_1gb_7days',
            'USA 1GB - 7 Days',
            4.50
        )
        print(f"Order created: {order['orderReference']}")
        
        # Check order status
        status = api.get_order_status(order['orderReference'])
        print(f"Order status: {status['order']['status']}")
        
        # List all eSIMs
        esims = api.list_esims()
        print(f"Total eSIMs: {esims['pagination']['total']}")
        
        # Get specific eSIM details
        if esims['esims']:
            esim_id = esims['esims'][0]['id']
            details = api.get_esim_details(esim_id)
            print(f"eSIM {details['esim']['iccid']} - Status: {details['esim']['status']}")
    
    except Exception as e:
        print(f"Error: {e}")


if __name__ == '__main__':
    main()
```

## PHP

### Complete Integration Example

```php
<?php

class ESIMflyAPI {
    private $accessCode;
    private $secretKey;
    private $useHMAC;
    private $baseURL = 'https://esimfly.net/api/v1/business';
    
    public function __construct($accessCode, $secretKey, $useHMAC = true) {
        $this->accessCode = $accessCode;
        $this->secretKey = $secretKey;
        $this->useHMAC = $useHMAC;
    }
    
    /**
     * Generate HMAC authentication headers
     */
    private function generateHMACHeaders($body = '') {
        $timestamp = (string)(time() * 1000);
        $requestId = vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex(random_bytes(16)), 4));
        
        // Concatenate signing data
        $signData = $timestamp . $requestId . $this->accessCode . $body;
        
        // Calculate HMAC-SHA256
        $signature = strtoupper(hash_hmac('sha256', $signData, $this->secretKey));
        
        return [
            'RT-AccessCode' => $this->accessCode,
            'RT-RequestID' => $requestId,
            'RT-Timestamp' => $timestamp,
            'RT-Signature' => $signature
        ];
    }
    
    /**
     * Make API request
     */
    private function request($method, $endpoint, $data = null) {
        $url = $this->baseURL . $endpoint;
        $body = $data ? json_encode($data) : '';
        
        $headers = ['Content-Type: application/json'];
        
        if ($this->useHMAC) {
            $hmacHeaders = $this->generateHMACHeaders($body);
            foreach ($hmacHeaders as $key => $value) {
                $headers[] = "$key: $value";
            }
        } else {
            $headers[] = "RT-AccessCode: {$this->accessCode}";
        }
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $result = json_decode($response, true);
        
        if ($httpCode >= 400) {
            throw new Exception('API Error: ' . ($result['error'] ?? 'Unknown error'));
        }
        
        return $result;
    }
    
    /**
     * Get account balance
     */
    public function getBalance() {
        return $this->request('GET', '/balance');
    }
    
    /**
     * Order a new eSIM
     */
    public function orderESIM($packageCode, $packageName, $price, $quantity = 1) {
        return $this->request('POST', '/esims/order', [
            'packageCode' => $packageCode,
            'packageName' => $packageName,
            'price' => $price,
            'quantity' => $quantity
        ]);
    }
    
    /**
     * Get order status
     */
    public function getOrderStatus($orderReference) {
        return $this->request('GET', "/esims/order?orderReference=$orderReference");
    }
    
    /**
     * List all eSIMs
     */
    public function listESIMs($page = 1, $limit = 20, $status = null) {
        $endpoint = "/esims?page=$page&limit=$limit";
        if ($status) {
            $endpoint .= "&status=$status";
        }
        return $this->request('GET', $endpoint);
    }
    
    /**
     * Get eSIM details
     */
    public function getESIMDetails($esimId) {
        return $this->request('GET', "/esims/$esimId");
    }
    
    /**
     * Top-up an eSIM
     */
    public function topupESIM($esimId, $packageCode, $packageName, $price) {
        return $this->request('POST', "/esims/$esimId/topup", [
            'packageCode' => $packageCode,
            'packageName' => $packageName,
            'price' => $price
        ]);
    }
}

// Usage example
try {
    $api = new ESIMflyAPI('esf_your_access_code', 'sk_your_secret_key');
    
    // Check balance
    $balance = $api->getBalance();
    echo "Current balance: $" . $balance['balance'] . "\n";
    
    // Order an eSIM
    $order = $api->orderESIM(
        'airalo_usa_1gb_7days',
        'USA 1GB - 7 Days',
        4.50
    );
    echo "Order created: " . $order['orderReference'] . "\n";
    
    // Check order status
    $status = $api->getOrderStatus($order['orderReference']);
    echo "Order status: " . $status['order']['status'] . "\n";
    
    // List all eSIMs
    $esims = $api->listESIMs();
    echo "Total eSIMs: " . $esims['pagination']['total'] . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
```

## cURL Examples

### Simple API Key Authentication

```bash
# Get balance
curl -X GET https://esimfly.net/api/v1/business/balance \
  -H "RT-AccessCode: esf_your_access_code"

# Order eSIM
curl -X POST https://esimfly.net/api/v1/business/esims/order \
  -H "RT-AccessCode: esf_your_access_code" \
  -H "Content-Type: application/json" \
  -d '{
    "packageCode": "airalo_usa_1gb_7days",
    "packageName": "USA 1GB - 7 Days",
    "price": 4.50,
    "quantity": 1
  }'

# Get order status
curl -X GET "https://esimfly.net/api/v1/business/esims/order?orderReference=ORD_123456" \
  -H "RT-AccessCode: esf_your_access_code"
```

### HMAC Authentication with cURL

```bash
#!/bin/bash

# Your credentials
ACCESS_CODE="esf_your_access_code"
SECRET_KEY="sk_your_secret_key"

# Generate timestamp and request ID
TIMESTAMP=$(date +%s%3N)
REQUEST_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

# Request body
BODY='{"packageCode":"airalo_usa_1gb_7days","packageName":"USA 1GB - 7 Days","price":4.50}'

# Calculate signature
SIGN_DATA="${TIMESTAMP}${REQUEST_ID}${ACCESS_CODE}${BODY}"
SIGNATURE=$(echo -n "$SIGN_DATA" | openssl dgst -sha256 -hmac "$SECRET_KEY" | awk '{print toupper($2)}')

# Make request
curl -X POST https://esimfly.net/api/v1/business/esims/order \
  -H "RT-AccessCode: $ACCESS_CODE" \
  -H "RT-RequestID: $REQUEST_ID" \
  -H "RT-Timestamp: $TIMESTAMP" \
  -H "RT-Signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

## Error Handling

Always implement proper error handling in your integration:

```javascript
// JavaScript example
try {
  const result = await api.orderESIM(packageCode, packageName, price);
  console.log('Success:', result);
} catch (error) {
  if (error.response) {
    // API returned an error
    console.error('API Error:', error.response.data);
    
    switch (error.response.data.code) {
      case 'INSUFFICIENT_BALANCE':
        console.log('Please top up your balance');
        break;
      case 'INVALID_PACKAGE':
        console.log('The selected package is not available');
        break;
      case 'RATE_LIMIT_EXCEEDED':
        console.log('Too many requests, please slow down');
        break;
      default:
        console.log('An error occurred:', error.response.data.error);
    }
  } else {
    // Network or other error
    console.error('Network Error:', error.message);
  }
}
```

## Testing

### Production Environment

All API requests are made to the production environment. Use real package codes from the packages endpoint for testing.

## Best Practices

1. **Store credentials securely**
   - Use environment variables
   - Never commit credentials to version control
   - Rotate keys regularly

2. **Implement retry logic**
   ```javascript
   async function retryRequest(fn, retries = 3) {
     for (let i = 0; i < retries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === retries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   }
   ```

3. **Cache responses when appropriate**
   - Cache package listings
   - Cache balance checks (short TTL)
   - Never cache order results

4. **Log all API interactions**
   - Request/response data
   - Timestamps
   - Error details
   - Performance metrics

5. **Monitor rate limits**
   ```javascript
   response.headers['x-ratelimit-remaining']
   response.headers['x-ratelimit-reset']
   ```