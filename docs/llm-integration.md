---
sidebar_position: 3
title: AI / LLM Integration
description: Copy-paste prompts for ChatGPT, Claude, Cursor and Copilot that generate an eSIMfly Business API integration using the recommended architecture.
---

import LlmPrompt from '@site/src/components/LlmPrompt';

# AI / LLM Integration

Most partners now build their integration with an AI coding assistant. The prompts on this page
give the assistant everything it needs — authentication, every endpoint's exact shape, the error
codes — **and the architecture we recommend**, so the generated code is fast for your customers and
stays well inside the rate limits.

## The recommended architecture in one paragraph

eSIMfly is the source of truth for **provisioning**; your database is the source of truth for what
you **show**. Sync the package catalogue into your own database on a schedule and serve your
storefront from it — never call `/esims/packages` per customer request. Place orders with an
`idempotency_key`, persist the whole response, and render QR codes from `lpaString`. Complete
pending (async) eSIMs from the webhook, with a bounded polling fallback. Look up usage for one eSIM
on demand, cached. Diagnostics (live status, network events, usage reports) are support tools only.

| Endpoint | How it should be used | Typical requests |
|---|---|---|
| `GET /esims/packages` | Scheduled sync into your DB (every 6–12 h, `limit=100`, 1 req/s). Never delete rows — mark inactive | ~70 per sync |
| `POST /esims/order` | Inside the customer purchase, with `idempotency_key` | 1 per sale |
| `GET /esims/order` | Only for `pending_details` orders, 15–30 s, max ~10 min | rare |
| `GET /balance` | Checkout (60 s cache) + hourly low-balance alert; mirror `newBalance` from orders | ≤ 50 / day |
| `GET /topup/packages` | When the customer opens the top-up screen; cache 10 min per ICCID | 1 per screen |
| `POST /topup/order` | Inside the customer top-up, with a per-ICCID lock | 1 per top-up |
| `GET /esims/usage/query` | When a customer opens one eSIM; cache 5–15 min | 1 per view |
| `GET /esims` | Support search + optional nightly reconciliation of `ACTIVE` eSIMs | ≤ 50 / night |
| `GET /orders` | Daily incremental finance reconciliation (`from_date`) | ~5 / day |
| `POST /esims/status`, `/network-events`, `/usage-report` | Support console buttons, throttled | on demand |
| `POST /esims/suspend`, `/cancel`, `/send-sms` | Explicit operator / customer actions | on demand |
| `PUT /webhooks` | Once. Verify `X-Webhook-Signature`, dedupe on `X-Webhook-Id`, answer 2xx fast | once |

Default rate limits are **60 requests/minute, 1,000/hour, 10,000/day** per API key. The design
above keeps a typical reseller at a few hundred requests per day.

## Complete prompt (all endpoints)

Use this when you are building the whole integration. It is self-contained — the assistant does
not need to read the rest of these docs.

<LlmPrompt id="esimfly-api-full-prompt" />

## How to use the prompts

1. **Copy** the prompt (button above, or fetch the raw file at
   [`/llm/esimfly-api-full-prompt.txt`](/llm/esimfly-api-full-prompt.txt)).
2. **Add your context** below it: language/framework, database, how orders are created in your
   system, where credentials live. For example:

   ```text
   Stack: Node.js 20 + NestJS + PostgreSQL (Prisma). Credentials in ESIMFLY_ACCESS_CODE and
   ESIMFLY_SECRET_KEY. Our orders table already exists (id uuid, status, customer_id).
   Start with the shared HTTP client and the package sync job.
   ```

3. **Ask for one deliverable at a time** — the shared signed client first, then the catalogue
   sync, then ordering, then the webhook receiver — and run the checklist at the end of the prompt.
4. **Give agents the raw URLs.** Coding agents that can browse can read
   [`/llms.txt`](/llms.txt) (an index of all prompts) or any `/llm/<endpoint>.txt` directly.

## Per-endpoint prompts

Every endpoint page has its own prompt with the same rules, scoped to that endpoint. Use these when
you only need one capability (for example adding top-ups to an existing integration). Do **not**
paste all fifteen to build a full integration — use the complete prompt above instead.

| Endpoint | Prompt |
|---|---|
| Balance Query | [page](/docs/api/balance) · [raw](/llm/balance.txt) |
| Get All Packages | [page](/docs/api/packages) · [raw](/llm/packages.txt) |
| Create Order | [page](/docs/api/create-order) · [raw](/llm/create-order.txt) |
| Get Topup Packages | [page](/docs/api/topup-packages) · [raw](/llm/topup-packages.txt) |
| Process Topup Order | [page](/docs/api/topup-order) · [raw](/llm/topup-order.txt) |
| List All eSIMs | [page](/docs/api/esims) · [raw](/llm/esims.txt) |
| Query eSIM Usage | [page](/docs/api/esims-usage) · [raw](/llm/esims-usage.txt) |
| eSIM Status (live) | [page](/docs/api/esim-status) · [raw](/llm/esim-status.txt) |
| Network Events | [page](/docs/api/network-events) · [raw](/llm/network-events.txt) |
| Usage Report | [page](/docs/api/usage-report) · [raw](/llm/usage-report.txt) |
| Suspend / Activate eSIM | [page](/docs/api/suspend-esim) · [raw](/llm/suspend-esim.txt) |
| Cancel eSIM | [page](/docs/api/cancel-esim) · [raw](/llm/cancel-esim.txt) |
| Send SMS | [page](/docs/api/send-sms) · [raw](/llm/send-sms.txt) |
| Orders | [page](/docs/api/orders) · [raw](/llm/orders.txt) |
| Webhooks | [page](/docs/api/webhooks) · [raw](/llm/webhooks.txt) |

## Why we ask you to sync the catalogue

`GET /esims/packages` assembles and prices the complete multi-provider catalogue (7,000+ packages)
on every call and paginates it in memory. Calling it per customer search or page view is slow for
your users, quickly exhausts your hourly quota, and is expensive for everyone. A scheduled sync into
your own database is roughly 70 requests every 6–12 hours, gives your storefront millisecond
responses, lets you add your own margin and search index, and keeps order history intact because
you mark packages inactive instead of deleting them. The order endpoint charges the current price
and only needs `packageCode`, so a slightly stale catalogue never causes a wrong charge.

## Keeping the prompts current

The prompts are generated from the same source as these docs and change when the API changes.
Re-copy them when you add a capability, and check the [changelog](https://github.com/eSimfly-Official/api-docs/blob/main/CHANGELOG.md)
for breaking changes such as renamed fields.
