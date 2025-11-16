# Contributing to eSIMfly API Documentation

Thank you for your interest in improving the eSIMfly API documentation! We welcome contributions from developers who use our API.

## 🎯 How You Can Contribute

- **Fix typos or errors** in documentation
- **Add code examples** in different languages
- **Improve explanations** of API concepts
- **Share integration guides** for popular frameworks
- **Report missing or unclear documentation**
- **Suggest improvements** to error messages or examples

## 📋 Contribution Guidelines

### Before You Start

1. Check existing [issues](https://github.com/esimfly/api-docs/issues) to avoid duplicates
2. For major changes, open an issue first to discuss
3. Make sure your contribution follows our style guide

### Style Guide

**Markdown Formatting:**
- Use clear, concise language
- Include code examples where helpful
- Use proper heading hierarchy (h1 → h2 → h3)
- Add syntax highlighting to code blocks

**Code Examples:**
- Test all code examples before submitting
- Include examples in multiple languages when possible (JavaScript, Python, PHP, cURL)
- Add comments to explain complex logic
- Use realistic but fake data (never real API keys)

**API References:**
- Document all parameters with types
- Include both success and error response examples
- Show HTTP status codes
- Explain edge cases and limitations

### Making Changes

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/api-docs.git
   cd api-docs
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/improve-webhook-docs
   ```

3. **Make your changes**
   - Edit files in the `docs/` directory
   - Test locally with `npm start`
   - Ensure the site builds with `npm run build`

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Improve webhook documentation with Python example"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/improve-webhook-docs
   ```
   Then open a Pull Request on GitHub

### Pull Request Process

1. **Title**: Use clear, descriptive PR titles
   - ✅ "Add Python example for order creation"
   - ❌ "Update docs"

2. **Description**: Explain what and why
   ```markdown
   ## Changes
   - Added Python code example for creating orders
   - Fixed typo in authentication section

   ## Why
   Many developers requested Python examples for order flow
   ```

3. **Review**: We'll review your PR within 2-3 business days
4. **Merge**: Once approved, we'll merge and deploy

## 🐛 Reporting Issues

Found a problem? [Open an issue](https://github.com/esimfly/api-docs/issues/new) with:

- **Clear title**: "Error code table missing TOPUP_FAILED"
- **Description**: What's wrong and where
- **Expected behavior**: What should happen instead
- **Screenshots**: If applicable

## 💡 Suggesting Features

Have ideas for documentation improvements?

1. Check if similar suggestion exists
2. Open a feature request issue
3. Explain the use case and benefits
4. Provide examples if possible

## 🏅 Recognition

Contributors will be:
- Listed in our CONTRIBUTORS.md file
- Mentioned in release notes for significant contributions
- Eligible for eSIMfly swag and credits (case by case)

## 📜 Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Help create a welcoming environment
- Focus on what's best for developers using the API

## ❓ Questions?

- **Documentation questions**: Check [docs.esimfly.net](https://docs.esimfly.net)
- **API support**: support@esimfly.net
- **Contribution help**: Open a discussion on GitHub

## 🔒 Security

**DO NOT** include in contributions:
- Real API keys or secrets
- Customer data or PII
- Internal system details
- Security vulnerabilities (report privately to security@esimfly.net)

## 📝 License

By contributing, you agree that your contributions will be licensed under the same license as this project (CC BY-NC-SA 4.0).

---

Thank you for helping make eSIMfly's API documentation better for everyone! 🚀
