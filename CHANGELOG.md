# Changelog

All notable changes to the eSIMfly API and documentation will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 2026-11-26 — Phone-number lines, response cleanups

- **Orders:** `recurring` is ignored — phone-number lines are sold one period at a time.
- **Cancel:** phone-number lines can be cancelled within 3 days of purchase (where the network allows
  online cancellation), full price back to the wallet.
- **Response cleanups:** `GET /esims/packages` no longer returns `provider`; the order lookup no longer
  returns `esim.provider` and returns `packageCode` exactly as ordered; eSIMs still being provisioned have
  `iccid: null` (also in `GET /orders`); top-up status `details` holds only `status`, `message`,
  `esim_id`, `topup_order_id`; error messages never pass through upstream network text.

### 2026-11-19 — Top-up idempotency, partial fills, wallet currencies

- **Top-ups:** `POST /topup/order` accepts `idempotency_key` (a retry returns the original top-up with
  `duplicate: true`); concurrent identical top-ups return `409 DUPLICATE_REQUEST`; `quantity` is
  ignored (always one package). Documented `GET /topup/order?orderReference=` (top-up status) and the
  full eligibility list (`ACTIVE`, `IN_USE`, `DEPLETED`, `EXPIRED`, `USED_EXPIRED`, `NEW` for eSIMfly).
- **Orders:** `quantity` must be a whole number 1–10 (`INVALID_QUANTITY`); partial fills report
  `quantity` / `requestedQuantity` / `note` and charge only what was delivered; `PACKAGE_NOT_AVAILABLE`.
- **Packages:** voice / SMS allowances can be `"unlimited"`; phone-number lines carry `roaming`,
  `voice_description`; `cost_usd`, `flag_url`; type `localesim`.
- **Currency:** accounts on EUR, CHF or NOK wallets are quoted and charged in that currency.
- **SDK / MCP:** `@esimfly/sdk` 0.2.0 (`topups.create({ idempotencyKey })`, `topups.get`) and
  `@esimfly/mcp` 0.2.0 (idempotent `topup_esim`, new `get_topup` tool). AI prompts updated to match.

### Coming Soon
- GraphQL API endpoint (beta)
- WebSocket support for real-time updates
- Additional regional eSIM packages
- Enhanced analytics dashboard

---

## [1.0.0] - 2025-01-16

### 🎉 Initial Public Release

#### Added
- **API Documentation** - Complete public API documentation
- **Authentication System** - HMAC-SHA256 signature-based authentication
- **Balance Management** - Query account balance endpoint
- **Package Listings** - Get available eSIM packages with pricing
- **Order Management** - Create and track eSIM orders
- **eSIM Operations** - List and query eSIM usage
- **Top-up Support** - eSIM data top-up functionality
- **Webhooks** - Real-time event notifications
- **Error Handling** - Comprehensive error codes and responses
- **Code Examples** - Multiple language examples (Node.js, Python, PHP, cURL)
- **Best Practices Guide** - Production-ready integration guidelines
- **Rate Limiting** - 1000 requests per hour
- **API Versioning** - v1 API with backward compatibility promise

#### Endpoints
- `GET /api/v1/business/balance` - Check account balance
- `GET /api/v1/business/esims/packages` - List available packages
- `POST /api/v1/business/esims/order` - Create new order
- `GET /api/v1/business/esims` - List purchased eSIMs
- `GET /api/v1/business/esims/usage` - Query eSIM data usage
- `GET /api/v1/business/orders` - View order history
- `GET /api/v1/business/topup/packages` - Get top-up packages
- `POST /api/v1/business/topup/order` - Process top-up

#### Documentation
- Complete API reference documentation
- Interactive examples and code snippets
- Authentication guide with signature examples
- Webhook integration guide
- Error codes reference
- Best practices for production use
- Security guidelines
- Contributing guidelines

#### Security
- HMAC-SHA256 request signing
- Timestamp validation (5-minute window)
- Unique request ID requirement
- HTTPS-only endpoints
- Webhook signature verification
- IP whitelisting support

#### Developer Experience
- Docusaurus-powered documentation site
- Search functionality
- Mobile-responsive design
- Dark mode support
- Copy-to-clipboard for code examples
- Multi-language code samples

---

## Future Versions

### [1.1.0] - Planned Q1 2025

#### Planned Features
- **Bulk Operations** - Batch order creation
- **Advanced Filtering** - Enhanced package search
- **Usage Alerts** - Proactive notifications for data usage
- **Custom Branding** - White-label eSIM customization
- **Analytics API** - Detailed usage statistics

### [1.2.0] - Planned Q2 2025

#### Planned Features
- **GraphQL API** - Alternative to REST
- **Real-time Updates** - WebSocket support
- **Advanced Webhooks** - More event types
- **SDK Libraries** - Official SDKs for popular languages
- **API Playground** - Interactive API testing tool

---

## Version History Notes

### Version 1.0 Highlights

**January 16, 2025** marks the official public release of eSIMfly's B2B API. This release includes:

✅ **Production-Ready API**
- Battle-tested endpoints serving millions of eSIMs
- 99.9% uptime SLA
- Sub-100ms average response times
- Global infrastructure

✅ **Comprehensive Documentation**
- 50+ pages of detailed documentation
- 100+ code examples
- Complete error handling guide
- Security best practices

✅ **Developer-Friendly**
- RESTful design principles
- Predictable response formats
- Clear error messages
- Extensive examples

✅ **Enterprise Features**
- HMAC-SHA256 security
- Webhook notifications
- Rate limiting
- Request tracking

---

## Migration Guides

### From Private Beta to v1.0

If you were using our private beta API, here are the changes:

**Breaking Changes:**
- None! v1.0 is backward compatible with beta

**New Features You Can Use:**
- Webhook events for order status
- Enhanced error codes
- Top-up API endpoints
- Usage statistics endpoint

**Recommended Actions:**
1. Update to new base URL if using beta URL
2. Implement webhook listeners
3. Add error handling for new error codes
4. Test top-up functionality

---

## Deprecation Policy

We follow a strict deprecation policy:

1. **Announcement**: 6 months before deprecation
2. **Warning Headers**: Added to deprecated endpoints
3. **Migration Guide**: Provided with alternatives
4. **Support Period**: 6 months after deprecation
5. **Removal**: Only after full migration period

**Current Deprecations:** None

---

## Support

- **Documentation**: [docs.esimfly.net](https://docs.esimfly.net)
- **Support Email**: support@esimfly.net
- **GitHub Issues**: [github.com/esimfly/api-docs/issues](https://github.com/esimfly/api-docs/issues)

---

## Links

- [Documentation](https://docs.esimfly.net)
- [API Reference](https://docs.esimfly.net/docs/api-reference)
- [Business Dashboard](https://esimfly.net/business-dashboard)
- [Website](https://esimfly.net)

---

**Legend:**
- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security improvements
