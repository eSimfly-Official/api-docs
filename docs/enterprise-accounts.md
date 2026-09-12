---
sidebar_position: 4
title: Enterprise Accounts
---

# Enterprise Accounts

An enterprise account holds its own balance on the network and its own pool of
eSIMs. Orders draw from that pool and usage is billed against that balance,
instead of the prepaid wallet a standard account uses.

**Your integration does not change.** Same endpoints, same authentication, same
field names and types. What changes is which account the numbers describe — and
in one mode, which packages you can order.

If you are not on an enterprise account, nothing on this page applies to you and
nothing in the API has changed.

## How to tell

Call [`/balance`](/docs/api/balance). An enterprise account returns a `source`
field; a standard account does not.

```json
{
  "success": true,
  "data": {
    "balance": 4250.00,
    "currency": "EUR",
    "source": "enterprise",
    "account": "Acme Telecom Ltd",
    "live": true,
    "as_of": "2026-09-12T08:24:36.107Z"
  }
}
```

```javascript
const { data } = await api.get('/balance');

if (data.source === 'enterprise') {
  // Billed against the enterprise balance.
}
```

:::caution Currency is EUR
Enterprise balances are held in EUR. If your code assumes `USD` or `IQD`, read the
`currency` field instead of hard-coding it.
:::

## Two modes

| | Managed | Self-service |
|---|---|---|
| Packages you order | The standard eSIMfly catalogue | **Your own** packages |
| `/esims/packages` returns | The usual catalogue | Only your packages |
| `package_code` looks like | `"1654977"` | `"ent_1234567"` |
| `type` field | `"local"` / `"regional"` / `"global"` | `"enterprise"` |

Which mode you are on is set when your account is created. Ask support if you are
not sure.

### Managed

Nothing changes. You order from the same catalogue as every other partner; only
the balance the order bills against is different.

### Self-service

You design your own packages — coverage, data allowance, validity — in the
enterprise portal, and the API serves **those** instead of the shared catalogue.

```json
{
  "package_code": "ent_1234567",
  "name": "Turkey Unlimited",
  "region": "Turkey",
  "type": "enterprise",
  "data_amount_gb": 0,
  "validity_days": 1,
  "cost": 0,
  "currency": "EUR",
  "is_unlimited": true,
  "provider": "enterprise"
}
```

Order and top up exactly as normal, passing that `package_code`:

```javascript
await api.post('/esims/order', { packageCode: 'ent_1234567', quantity: 1 });
```

:::tip Treat package codes as opaque
Package code formats differ between providers — `"PHAJHEAYP"`, `"1654977"`,
`"ent_1234567"`. Never parse one or assume it is a number. Send back exactly what
`/esims/packages` gave you.
:::

## Errors you may see

| Code | HTTP | Meaning |
|---|---|---|
| `PACKAGE_NOT_FOUND` | 404 | An `ent_` package code that does not belong to your account, or is no longer active. Re-read `/esims/packages` |
| `INVALID_TOPUP_PACKAGE` | 404 | The same, on `/topup/order` |
| `INSUFFICIENT_BALANCE` | 400 | Your enterprise balance is too low. Top it up in the portal |

## Balance and billing

- **Usage is billed against your enterprise balance**, not a prepaid wallet, so
  `/balance` is the figure that matters.
- **Data is switched off automatically when the balance reaches zero**, across
  every SIM on the account, and restored automatically once you top up. Calls and
  SMS are unaffected.
- You will receive a **low balance warning** by email before that happens, at the
  threshold set on your account.

Top-ups are made in the enterprise portal, not through the API.

## The portal

Signing in takes you to the enterprise portal at
[esimfly.net/enterprise](https://esimfly.net/enterprise). Your balance, SIM fleet,
usage and billing all live there. The standard business dashboard is not used for
enterprise accounts — it describes a different account and is closed to avoid
showing you the wrong numbers.
