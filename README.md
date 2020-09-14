# Exante ![CI Status](https://github.com/b2broker/exante-node/workflows/CI/badge.svg) [![GitHub version](https://badge.fury.io/gh/b2broker%2Fexante-node.svg)](https://badge.fury.io/gh/b2broker%2Fexante-node) [![npm version](https://badge.fury.io/js/exante.svg)](https://badge.fury.io/js/exante) [![Known Vulnerabilities](https://snyk.io/test/github/b2broker/exante-node/badge.svg)](https://snyk.io/test/github/b2broker/exante-node) [![Coverage Status](https://coveralls.io/repos/github/b2broker/exante-node/badge.svg?branch=master)](https://coveralls.io/github/b2broker/exante-node?branch=master) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) ![GitHub top language](https://img.shields.io/github/languages/top/b2broker/exante-node) ![node-current](https://img.shields.io/node/v/exante) ![npm](https://img.shields.io/npm/dt/exante) ![GitHub](https://img.shields.io/github/license/b2broker/exante-node)

Node.js library for Exante's [API](https://api-live.exante.eu/api-docs/).

## Installation

```bash
npm install exante
```

## Usage

The library currently supports the following API versions: `2.0` and `3.0` (see [API versions](https://api-live.exante.eu/api-docs/#section/API-versions)). For more detailed documentation please see [docs](https://b2broker.github.io/exante-node/).

### RestClient

```typescript
import { RestClient } from "exante";
const client_id = "d0c5340b-6d6c-49d9-b567-48c4bfca13d2";
const app_id = "6cca6a14-a5e3-4219-9542-86123fc9d6c3";
const shared_key = "5eeac64cc46b34f5332e5326/CHo4bRWq6pqqynnWKQg";
const demo = false;
const client = new RestClient({ client_id, app_id, shared_key, demo });
```

- [`getAccounts`](https://api-live.exante.eu/api-docs/#operation/getAccounts)

```typescript
const version = "3.0";
const accounts = await client.getAccounts({ version });
```

- [`getDailyChanges`](https://api-live.exante.eu/api-docs/#operation/getDailyChanges)

```typescript
const version = "2.0";
const changes = await client.getDailyChanges({ version });
```

- [`getDailyChange`](https://api-live.exante.eu/api-docs/#operation/getDailyChange)

```typescript
const version = "3.0";
const symbolId = ["AAPL.NASDAQ", "MSFT.NASDAQ"];
const changes = await client.getDailyChange({ version, symbolId });
```

- [`getCurrencies`](https://api-live.exante.eu/api-docs/#operation/getCurrencies)

```typescript
const version = "2.0";
const currencies = await client.getCurrencies({ version });
```

- [`getCrossrate`](https://api-live.exante.eu/api-docs/#operation/getCrossrate)

```typescript
const from = "USD";
const to = "EUR";
const crossrate = await client.getCrossrate({ from, to });
```

- [`getExchanges`](https://api-live.exante.eu/api-docs/#operation/getExchanges)

```typescript
const version = "3.0";
const exchanges = await client.getExchanges({ version });
```

- [`getLastQuote`](https://api-live.exante.eu/api-docs/#operation/getQuoteLast)

```typescript
const symbolIds = ["MSFT.NASDAQ", "AAPL.NASDAQ"];
const level = "market_depth";
const quote = await client.getLastQuote({ symbolIds, level });
```

- [`getCandles`](https://api-live.exante.eu/api-docs/#operation/getOHLC)

```typescript
const version = "3.0";
const duration = "3600";
const symbolId = "AAPL.NASDAQ";
const from = 1481565600000;
const to = 1481572800000;
const size = 1;
const candles = await client.getCandles({
  version,
  duration,
  symbolId,
  from,
  to,
  size,
});
```

- [`getTicks`](https://api-live.exante.eu/api-docs/#operation/getTicks)

```typescript
const version = "2.0";
const symbolId = "AAPL.NASDAQ";
const from = "1481565600000";
const to = 1481572800000;
const size = 1;
const type = "trades";
const ticks = await client.getTicks({
  version,
  symbolId,
  from,
  to,
  size,
  type,
});
```

- [`getAccountSummary`](https://api-live.exante.eu/api-docs/#operation/getAccountSummary)

```typescript
const version = "3.0";
const id = "ABC1234.001";
const date = "2013-02-16";
const currency = "EUR";
const summary = await client.getAccountSummary({
  version,
  id,
  date,
  currency,
});
```

- [`getTransactions`](https://api-live.exante.eu/api-docs/#operation/getTransactions)

```typescript
const symbolId = "AAPL.NASDAQ";
const operationType = ["TRADE"];
const limit = 1;
const transactions = await client.getTransactions({
  symbolId,
  operationType,
  limit,
});
```

- [`placeOrder`](https://api-live.exante.eu/api-docs/#operation/placeOrder)

```typescript
const version = "3.0";
const symbolId = "AAPL.NASDAQ";
const side = "sell";
const quantity = "1";
const limitPrice = "10000";
const duration = "good_till_cancel";
const orderType = "limit";
const accountId = "ABC1234.001";
const order = await client.placeOrder({
  version,
  symbolId,
  side,
  quantity,
  limitPrice,
  duration,
  orderType,
  accountId,
});
```

- [`getOrders`](https://api-live.exante.eu/api-docs/#operation/getOrders)

```typescript
const version = "2.0";
const limit = "10";
const from = "2017-05-18T10:00:00.000Z";
const to = "2017-05-21T17:59:59.999Z";
const account = "ABC1234.001";
const orders = await client.getOrders({ version, limit, from, to, account });
```

- [`getActiveOrders`](https://api-live.exante.eu/api-docs/#operation/getActiveOrders)

```typescript
const instrument = "APL.NASDAQ";
const account = "ABC1234.001";
const orders = await client.getActiveOrders({ instrument, account });
```

- [`modifyOrder`](https://api-live.exante.eu/api-docs/#operation/modifyOrder)

```typescript
const version = "3.0";
const orderId = "d642d2ca-fcb5-4910-9de4-7c91f275ca23";
const action = "replace";
const limitPrice = "101.0";
const quantity = "7";
const stopPrice = "102.0";
const priceDistance = "1.0";
const order = await client.modifyOrder({
  version,
  orderId,
  action,
  parameters: { limitPrice, quantity, stopPrice, priceDistance },
});
```

## Test

```bash
npm test
```
