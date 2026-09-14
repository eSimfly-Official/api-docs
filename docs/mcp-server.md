---
sidebar_position: 4
title: MCP Server (AI agents)
description: Connect Claude, Cursor, ChatGPT and other AI agents to the eSIMfly Business API with the official MCP server.
---

# MCP Server — eSIMfly for AI agents

`@esimfly/mcp` is the official [Model Context Protocol](https://modelcontextprotocol.io) server for
the Business API. Once connected, your AI assistant can search plans with your wholesale prices,
check balances and usage, diagnose "no data" tickets from live network data and — only if you enable
it — place orders and top-ups with an explicit confirmation step.

Typical uses: a support agent asking *"why does ICCID 8948… have no data?"*, a developer exploring
the real catalogue from inside the IDE while the assistant writes the integration, or an ops
assistant that keeps an eye on balance and low-data eSIMs.

## Two ways to connect

| | Hosted server (recommended) | Local server (`npx`) |
|---|---|---|
| URL / command | `https://mcp.esimfly.net/mcp` | `npx -y @esimfly/mcp` |
| Login | Sign in with your eSIMfly business account (OAuth) — no keys to paste | API access code + secret in the client config |
| Works in | Claude.ai, Claude Desktop & mobile, ChatGPT, Claude Code, Cursor, VS Code, Windsurf | Claude Desktop, Claude Code, Cursor, VS Code, Windsurf |
| Write tools | Chosen on the consent screen (off by default) | `ESIMFLY_MCP_ALLOW_WRITES=true` |
| Revoke | Business Dashboard → Settings → API Keys → “MCP (AI agents)” | Delete the config entry |

Both expose exactly the same tools and prompts.

## Hosted server

Add `https://mcp.esimfly.net/mcp` as a remote MCP server; the client opens an eSIMfly login page,
you approve access (and optionally allow orders / top-ups), and you're connected. Access runs on a
dedicated **“MCP (AI agents)”** API key created on your account at first consent, so it appears in
your dashboard with your normal rate limits and can be revoked there at any time.

- **Claude.ai / Claude Desktop:** Settings → Connectors → *Add custom connector* → name `eSIMfly`, URL `https://mcp.esimfly.net/mcp` → Add → *Connect* and sign in.
- **ChatGPT:** Settings → Connectors → *Create* → name `eSIMfly`, MCP server URL `https://mcp.esimfly.net/mcp`, authentication *OAuth* → Create, then sign in when prompted.
- **Claude Code:** `claude mcp add --transport http esimfly https://mcp.esimfly.net/mcp` then `/mcp` → *Authenticate*.
- **Cursor / VS Code / Windsurf:** `{ "mcpServers": { "esimfly": { "url": "https://mcp.esimfly.net/mcp" } } }` — the client starts the login on first use.

The server implements the MCP authorization spec (OAuth 2.1 with PKCE, dynamic client registration,
discovery at `https://mcp.esimfly.net/.well-known/oauth-protected-resource/mcp`), so any compliant client works without
special configuration. Tokens last 24 hours and refresh automatically for 90 days.

The hosted server is also listed on [Smithery](https://smithery.ai/servers/akam19901205/esimfly), in the
[official MCP Registry](https://registry.modelcontextprotocol.io) as `io.github.eSimfly-Official/esimfly-mcp`,
and on [Glama](https://glama.ai/mcp/servers/eSimfly-Official/esimfly-mcp) — install from any of them, or use the URL directly.

## Local server

The server runs locally over stdio; your API key stays on your machine.

**Claude Desktop** — `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "esimfly": {
      "command": "npx",
      "args": ["-y", "@esimfly/mcp"],
      "env": { "ESIMFLY_ACCESS_CODE": "esf_...", "ESIMFLY_SECRET_KEY": "sk_..." }
    }
  }
}
```

**Claude Code:**

```bash
claude mcp add esimfly -e ESIMFLY_ACCESS_CODE=esf_... -e ESIMFLY_SECRET_KEY=sk_... -- npx -y @esimfly/mcp
```

**Cursor / Windsurf / other clients** — same `command` / `args` / `env` block in the client's `mcp.json`.

To enable the write tools add `"ESIMFLY_MCP_ALLOW_WRITES": "true"` to `env`.

## Tools

| Tool | What it does | Mode |
|---|---|---|
| `search_packages` | Catalogue search by destination / type with your cost price | read |
| `get_balance` | Account (or enterprise) balance | read |
| `list_esims` | Your eSIMs with status, data left, validity | read |
| `get_esim_usage` | Stored usage for one eSIM (cheap) | read |
| `get_esim_live_status` | Live status from the network: install state, last network, device, usage | read |
| `get_network_events` | Last 7 days of attach / data-session events with wrong-network flag | read |
| `get_usage_report` | Daily usage by country and operator (up to 90 days) | read |
| `list_orders` / `get_order` | Order history and one order with its eSIM | read |
| `get_topup_packages` | Top-up options for one eSIM | read |
| `get_webhook_settings` | Webhook URL, events, recent deliveries | read |
| `create_order` | Buy eSIMs — preview, then `confirm: true` + idempotency key | write |
| `topup_esim` | Add data to an eSIM — preview shows package and cost | write |
| `cancel_esim` | Cancel an unused eSIM and refund to balance | write |
| `suspend_esim` / `activate_esim` | Block / restore network access | write |
| `send_sms` | Text the device holding the eSIM | write |
| `set_webhook` | Configure webhook URL and events | write |

Prompts: `esimfly_integration_guide` (the [complete integration prompt](/docs/llm-integration), always
current) and `diagnose_esim` (a guided connectivity diagnosis).

## Safety model

- **Read-only by default.** Write tools are not even registered unless you allow them — on the consent screen for the hosted server, or with `ESIMFLY_MCP_ALLOW_WRITES=true` locally.
- **Two-step writes.** A call without `confirm: true` returns a preview — package, cost, balance — and
  makes no mutable API call. `create_order` also requires the idempotency key from its own preview, so an
  agent cannot place the same order twice.
- Cancel and suspend are annotated as destructive so MCP hosts can ask for your approval.
- Give the agent its own API key from the dashboard and rotate it if in doubt.

Source, issues and changelog: [github.com/eSimfly-Official/esimfly-mcp](https://github.com/eSimfly-Official/esimfly-mcp) ·
[npm](https://www.npmjs.com/package/@esimfly/mcp).
