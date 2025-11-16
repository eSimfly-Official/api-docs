# eSIMfly API Documentation

> 📘 **Professional developer documentation for eSIMfly's B2B eSIM API**

This repository contains the official public API documentation for [eSIMfly](https://esimfly.net) - a leading eSIM connectivity platform. Built with [Docusaurus](https://docusaurus.io/) for an optimal developer experience.

## 🌐 Live Documentation

**Production**: [https://docs.esimfly.net](https://docs.esimfly.net)

## 🎯 What's Inside

Our API documentation covers:

- ✅ **Getting Started** - Quick integration guide
- 🔐 **Authentication** - HMAC-SHA256 security implementation
- 📡 **API Reference** - Complete endpoint documentation
- 💡 **Code Examples** - Node.js, Python, PHP, cURL samples
- 🎣 **Webhooks** - Real-time event notifications
- ⚡ **Best Practices** - Rate limiting, error handling, optimization
- 🛠️ **Testing Tools** - Interactive API playground

## 🚀 For Developers

### Quick Start with eSIMfly API

```bash
# Check your balance
curl --location 'https://esimfly.net/api/v1/business/balance' \
--header 'RT-AccessCode: YOUR_ACCESS_CODE' \
--header 'RT-RequestID: 550e8400-e29b-41d4-a716-446655440000' \
--header 'RT-Timestamp: 1628670421000' \
--header 'RT-Signature: YOUR_CALCULATED_SIGNATURE'
```

[Get your API credentials →](https://esimfly.net/business-dashboard/settings)

## 📦 Installation (For Contributing)

```bash
npm install
# or
yarn install
```

## 🔧 Local Development

```bash
npm run start
# or
yarn start
```

This command starts a local development server at `http://localhost:3000` with live reload.

## 🏗️ Build

```bash
npm run build
# or
yarn build
```

Generates static content into the `build` directory ready for deployment.

## 📂 Project Structure

```
documentation/
├── docs/               # Markdown documentation files
│   ├── intro.md       # Introduction & overview
│   ├── quick-start.md # Quick start guide
│   ├── api-authentication.md
│   ├── api/           # API endpoint documentation
│   │   ├── balance.md
│   │   ├── packages.md
│   │   ├── create-order.md
│   │   ├── esims.md
│   │   └── ...
│   ├── examples.md    # SDK code examples
│   └── webhooks.md    # Webhook documentation
├── src/               # React components & pages
├── static/            # Static assets (images, files)
├── docusaurus.config.js
└── sidebars.js        # Sidebar navigation structure
```

## 🎨 Customization

- **Theme**: Edit `src/css/custom.css`
- **Configuration**: Edit `docusaurus.config.js`
- **Navigation**: Edit `sidebars.js`

## 📝 Contributing

We welcome contributions! To add or update documentation:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/new-docs`)
3. Make your changes in the `docs/` directory
4. Test locally with `npm start`
5. Commit and push
6. Open a Pull Request

### Documentation Guidelines

- Use clear, concise language
- Include code examples in multiple languages when possible
- Follow the existing structure and formatting
- Test all code examples before submitting
- Add proper metadata (title, description) to markdown files

## 🔍 SEO & Discoverability

This documentation is optimized for:
- 🔎 Google indexing and ranking
- 🎯 Keyword targeting: "eSIM API", "eSIM integration", "eSIM reseller API"
- 📱 Mobile-responsive design
- ⚡ Fast page loads
- 🔗 Internal linking structure

## 🛡️ Security Notice

**Public vs Private Documentation**

This repository contains **PUBLIC** API documentation. We do NOT include:
- ❌ Secret keys or credentials
- ❌ Internal admin endpoints
- ❌ Partner-specific pricing details
- ❌ System architecture internals

Private/partner documentation is maintained separately.

## 🌍 Deployment

### Automatic Deployment
The documentation automatically deploys to `docs.esimfly.net` when changes are pushed to the `main` branch.

### Manual Deployment

```bash
npm run build
# Upload the build/ directory to your hosting
```

## 📊 Analytics

Documentation includes integrated analytics to track:
- Page views and popular endpoints
- Search queries
- User flow and engagement
- Geographic distribution of developers

## 🆘 Support

- **Developer Support**: support@esimfly.net
- **API Status**: [status.esimfly.net](https://status.esimfly.net)
- **Live Chat**: Available in [Business Dashboard](https://esimfly.net/business-dashboard)

## 📄 License

Copyright © 2025 eSIMfly. All rights reserved.

This documentation is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## 🔗 Links

- [eSIMfly Website](https://esimfly.net)
- [Business Solutions](https://esimfly.net/business)
- [Pricing](https://esimfly.net/pricing)
- [Blog & Updates](https://esimfly.net/blog)
- [Contact Sales](https://esimfly.net/contact)

---

Built with ❤️ by the eSIMfly team | Powered by [Docusaurus](https://docusaurus.io/)
